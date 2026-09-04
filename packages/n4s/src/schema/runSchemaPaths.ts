import { asArray, isObject } from 'vest-utils';

import { enforceLazy } from '../lazy';
import {
  PARTIAL_LIKE,
  RESOLVED_RELATIONSHIPS,
  UNRESOLVED_DEPS,
  chainBaselineMatches,
} from './dependencyResolver';
import { withSchemaExecutionProjection } from './projectionContext';
import type { PropertySegment, SchemaPath } from './SchemaPath';
import type { SchemaRelationship } from './SchemaRelationship';
import {
  runSchemaPaths as runSchemaPathsLegacy,
  type SelectiveRunOptions,
  type SelectiveSchema,
  type SelectiveSchemaResult,
} from './selectiveRun';

/**
 * Canonical dependency-aware schema runner.
 *
 * The established selective engine remains the fallback for nested paths,
 * containers and exotic schemas. Safe flat shape changes take a deliberately
 * smaller path here: relationship metadata plans the affected set, while the
 * executable fragment contains only affected validators. This prevents a
 * dependency provider from executing merely because a target depends on it.
 */
export function runSchemaPaths(
  schema: unknown,
  data: unknown,
  options: SelectiveRunOptions = {},
): SelectiveSchemaResult[] {
  const plan = safeFlatPlan(schema, options);
  if (plan === null) {
    return runSchemaPathsLegacy(schema, data, options);
  }
  if (plan.length === 0) {
    return [{ pass: true, type: data }];
  }

  const root = schema as SelectiveSchema;
  const members = root.__schema;
  if (!members) return runSchemaPathsLegacy(schema, data, options);

  const projectedMembers: Record<string, SelectiveSchema> = {};
  for (const field of plan) {
    const member = members[field];
    if (!member) return runSchemaPathsLegacy(schema, data, options);
    projectedMembers[field] = executionMember(member);
  }

  return withSchemaExecutionProjection(() => {
    // loose() is intentional: unrelated top-level input survives as data but
    // its validators are absent. The selected member rules still parse/coerce
    // their own values and keep normal field-path attribution.
    const projected = enforceLazy.loose(
      projectedMembers as never,
    ) as unknown as SelectiveSchema;
    return runSchemaPathsLegacy(projected, data, {});
  });
}

/**
 * Returns a safe flat affected plan, or null when the mature engine must own
 * the run. We only optimize cases whose semantics are completely provable
 * from construction metadata.
 */
function safeFlatPlan(
  schema: unknown,
  options: SelectiveRunOptions,
): string[] | null {
  const affected = options.affected;
  if (affected == null) return null;
  if (!isObject(schema)) return null;

  const root = schema as SelectiveSchema;
  if (!root.__schema || !isN4sSchema(root)) return null;
  if (!chainBaselineMatches(root)) return null;
  if (symbolSlotOf(root, PARTIAL_LIKE) === true) return null;

  const changed = stringEntries(affected);
  if (changed.some(isNestedName)) return null;

  const relationships = relationshipsOf(root);
  if (!flatRelationshipsAreSafe(relationships, changed)) return null;

  const planned = expandDirectFlatDependents(changed, relationships);
  const only = stringEntries(asArray(options.only ?? []));
  const narrowed =
    options.only == null
      ? planned
      : planned.filter(field => only.includes(field));

  if (options.skip === true) return [];
  const skipped = new Set(stringEntries(asArray(options.skip ?? [])));
  return narrowed.filter(field => !skipped.has(field));
}

function isN4sSchema(schema: SelectiveSchema): boolean {
  return (
    isObject(schema) &&
    (schema as unknown as { '~standard'?: { vendor?: unknown } })['~standard']
      ?.vendor === 'n4s'
  );
}

/**
 * The flat fast path is intentionally conservative. A relationship touching
 * an item or nested endpoint can require same-item fan-out or parent/child
 * matching, so the mature selective engine keeps ownership of that case.
 */
function flatRelationshipsAreSafe(
  relationships: readonly SchemaRelationship[],
  changed: readonly string[],
): boolean {
  for (const rel of relationships) {
    const source = flatProperty(rel.source);
    const target = flatProperty(rel.target);
    if (source === null || target === null) {
      if (changed.some(field => pathStartsWithField(rel.source, field))) {
        return false;
      }
    }
  }
  return true;
}

function pathStartsWithField(path: SchemaPath, field: string): boolean {
  const first = path[0];
  return first?.type === 'property' && String(first.key) === field;
}

function expandDirectFlatDependents(
  changed: readonly string[],
  relationships: readonly SchemaRelationship[],
): string[] {
  // Direct fan-out only. Newly-added targets are deliberately not fed back
  // into the graph: invalidation follows changed VALUES, not transitive
  // closure of stale validation results.
  const affected = new Set(changed);
  const changedSet = new Set(changed);
  for (const rel of relationships) {
    const source = flatProperty(rel.source);
    const target = flatProperty(rel.target);
    if (source !== null && target !== null && changedSet.has(source)) {
      affected.add(target);
    }
  }
  return [...affected];
}

function flatProperty(path: SchemaPath): string | null {
  if (path.length !== 1) return null;
  const [segment] = path as [PropertySegment];
  return segment?.type === 'property' ? String(segment.key) : null;
}

function relationshipsOf(schema: SelectiveSchema): SchemaRelationship[] {
  try {
    return schema.describe?.().relationships ?? [];
  } catch {
    return [];
  }
}

/**
 * A private execution view of one user rule. The relationship graph was
 * already consumed by the planner, so unresolved/resolved relationship slots
 * are hidden from fragment construction without mutating the reusable rule.
 * Runtime validation methods and every other piece of rule metadata still
 * delegate to the original object.
 */
function executionMember(member: SelectiveSchema): SelectiveSchema {
  if (!isObject(member)) return member;
  return new Proxy(member as object, {
    get(target, property, receiver) {
      if (property === UNRESOLVED_DEPS || property === RESOLVED_RELATIONSHIPS) {
        return [];
      }
      return Reflect.get(target, property, receiver);
    },
  }) as unknown as SelectiveSchema;
}

function symbolSlotOf(rule: unknown, slot: symbol): unknown {
  return (rule as Record<symbol, unknown>)[slot];
}

function stringEntries(entries: readonly unknown[]): string[] {
  return entries.filter((entry): entry is string => typeof entry === 'string');
}

function isNestedName(field: string): boolean {
  return field.includes('.') || field.includes('[');
}
