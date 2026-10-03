/** Opt-in suite.changed() support. */
import {
  canPickRelationshipSchema,
  resolveAffected,
} from 'n4s/exports/relationships';

import {
  installChangedHandler,
  type ChangedPlan,
} from '../suite/changedHandler';
import { ROOT_SCHEMA_FIELD } from '../suite/retainedSchemaFailures';
import {
  runSchemaWithParse,
  type SchemaRunResult,
} from '../suite/useCreateSuiteRunner';

const NO_FIELD = '\0vest.changed.none';
const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);

installChangedHandler(planRelationshipRun);

function planRelationshipRun(
  schema: unknown,
  fields: readonly string[],
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
): ChangedPlan {
  const selection = selectFields(schema, fields, data, modifiers);
  const selected = selection.focus.length ? selection.focus : [NO_FIELD];
  if (!schema) return { only: selected, schemaFocus: [], evaluated: null };
  if (!canPickRelationshipSchema(schema))
    return fullSchemaPlan(schema, data, selected, selection.skip);
  return pickedSchemaPlan(schema, data, selected, selection);
}

type Selection = { focus: string[]; schemaKeys: string[]; skip: Set<string> };

function selectFields(
  schema: unknown,
  fields: readonly string[],
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
): Selection {
  // The changed names always run, even when they are not schema paths.
  const names = fieldList(fields).filter(Boolean);
  const skip = new Set(fieldList(modifiers.skip));
  const affected = (
    isN4sSchema(schema) ? resolveAffected(schema, names, data) : []
  ).filter(path => !isSkipped(path.join('.'), skip));
  const named = [...names, ...fieldList(modifiers.only)].filter(
    field => !isSkipped(field, skip),
  );
  return {
    focus: [...new Set([...affected.map(path => path.join('.')), ...named])],
    // Structured paths keep a literal dotted key whole.
    schemaKeys: [
      ...new Set([
        ...affected.map(path => String(path[0])),
        ...named.map(topLevelKey),
      ]),
    ],
    skip,
  };
}

function topLevelKey(field: string): string {
  return field.split(/[.[]/)[0];
}

function isSkipped(name: string, skip: Set<string>): boolean {
  if (skip.size === 0) return false;
  return [...skip].some(
    field => name === field || name.startsWith(`${field}.`),
  );
}

function fullSchemaPlan(
  schema: unknown,
  data: unknown,
  only: string[],
  skip: Set<string>,
): ChangedPlan {
  const schemaResults = runSchemaWithParse(schema, data, {});
  return {
    only,
    schemaFocus: failurePaths(schemaResults, skip),
    schemaResults,
    evaluated: null,
  };
}

function pickedSchemaPlan(
  schema: { __schema: Record<string, unknown> },
  data: unknown,
  selected: string[],
  { schemaKeys: keys, skip }: Selection,
): ChangedPlan {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return fullSchemaPlan(schema, data, selected, skip);
  }
  if (Object.keys(data).some(key => UNSAFE.has(key))) {
    return fullSchemaPlan(schema, data, selected, skip);
  }
  const schemaKeys = new Set(Object.keys(schema.__schema));
  const validated = keys.filter(key => schemaKeys.has(key));
  const { results, value } = runSelectedFields(
    schema.__schema,
    data,
    validated,
  );
  const checked = new Set(validated);
  return {
    only: selected,
    schemaFocus: failurePaths(results, skip),
    schemaResults: results,
    value,
    evaluated: path =>
      path === undefined ? validated.length > 0 : checked.has(path[0]),
  };
}

function failurePaths(results: SchemaRunResult[], skip: Set<string>): string[] {
  const paths = results
    .filter(result => !result.pass)
    .map(result => result.path?.join('.') ?? ROOT_SCHEMA_FIELD);
  return [...new Set(paths)].filter(path => !isSkipped(path, skip));
}

function runSelectedFields(
  rules: Record<string, unknown>,
  data: object,
  keys: string[],
): { results: SchemaRunResult[]; value?: Record<string, unknown> } {
  const failures: SchemaRunResult[] = [];
  // The callback sees the input with validated fields parsed, like only().
  const input = copyInput(data);
  const value: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = Object.getOwnPropertyDescriptor(data, key)?.value;
    const rule = rules[key] as { run: (input: unknown) => SchemaRunResult };
    const result = rule.run(raw);
    if (result.pass) input[key] = value[key] = result.type;
    else failures.push(failureAt(key, result));
  }
  if (failures.length) return { results: failures };
  // The result value holds only what this run validated.
  return { results: [{ pass: true, type: input }], value };
}

function failureAt(key: string, result: SchemaRunResult): SchemaRunResult {
  return { ...result, path: [key, ...(result.path ?? [])] };
}

function copyInput(data: object): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(data),
  )) {
    if (descriptor.enumerable && 'value' in descriptor && !UNSAFE.has(key)) {
      output[key] = descriptor.value;
    }
  }
  return output;
}

function isN4sSchema(value: unknown): value is object {
  if (typeof value !== 'object' || value === null) return false;
  return (
    (value as { '~standard'?: { vendor?: string } })['~standard']?.vendor ===
    'n4s'
  );
}

function fieldList(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  return Array.isArray(value)
    ? value.filter((field): field is string => typeof field === 'string')
    : [];
}
