/**
 * Opt-in: the full invalidation graph of a suite, for tools and agents.
 * Imported only by vest/relationships, so it stays out of the core bundle.
 */
import type { Relationship, SchemaPath } from 'n4s/relationships';
import { isFunction, isStringValue } from 'vest-utils';

import { VestIsolateType } from '../core/isolate/VestIsolateType';

export type SuiteDescription = {
  /** The schema's relationship graph, as `schema.describe()` returns it. */
  relationships: Relationship[];
  /** The tests the last run registered, with the group each belongs to. */
  tests: { fieldName: string; groupName?: string }[];
  /** `include(target).when(source)` declarations of the last run. */
  includes: { source: string; target: string }[];
  /** Targets of `include()` declarations whose condition is not a field name. */
  dynamicIncludes: string[];
  /**
   * Relationship targets that no test of the last run covers. Their schema
   * rules still run; no user test checks them.
   */
  untested: SchemaPath[];
};

type TreeNode = {
  $type?: string;
  data?: Record<string, unknown> | null;
  children?: TreeNode[] | null;
};

const suiteSchemas = new WeakMap<object, unknown>();

/** Called when a suite is created after vest/relationships was imported. */
export function rememberSuite(suite: object, schema: unknown): void {
  suiteSchemas.set(suite, schema);
}

/**
 * Describes a suite's invalidation graph: its schema relationships, the tests
 * and `include().when()` declarations of its last run, and the relationship
 * targets no test covers. Suites register tests while they run, so run the
 * suite before describing it. Runs no tests.
 */
export function describeSuite(suite: { dump(): unknown }): SuiteDescription {
  if (!suiteSchemas.has(suite)) {
    throw new Error(
      "describeSuite() needs a suite created after: import 'vest/relationships'",
    );
  }
  const relationships = schemaRelationships(suiteSchemas.get(suite));
  const description: SuiteDescription = {
    relationships,
    tests: [],
    includes: [],
    dynamicIncludes: [],
    untested: [],
  };
  readTree(suite.dump() as TreeNode, undefined, description, new Set());
  description.untested = untestedTargets(relationships, description.tests);
  return description;
}

function schemaRelationships(schema: unknown): Relationship[] {
  const describe = (schema as { describe?: unknown } | undefined)?.describe;
  return isFunction(describe)
    ? (describe.call(schema) as { relationships: Relationship[] }).relationships
    : [];
}

// eslint-disable-next-line complexity
function readTree(
  node: TreeNode | null | undefined,
  groupName: string | undefined,
  description: SuiteDescription,
  seen: Set<string>,
): void {
  const data = node?.data ?? {};
  // Schema failures are reported as tests; they are not user tests.
  if (!node || data.schemaValidation) return;
  if (node.$type === VestIsolateType.Test && isStringValue(data.fieldName)) {
    addTest(description, seen, data.fieldName, groupName);
  }
  if (node.$type === 'Include' && isStringValue(data.fieldName)) {
    addInclude(description, data.fieldName, data.conditionRef);
  }
  const group =
    node.$type === VestIsolateType.Group && isStringValue(data.groupName)
      ? data.groupName
      : groupName;
  for (const child of node.children ?? []) {
    readTree(child, group, description, seen);
  }
}

function addTest(
  description: SuiteDescription,
  seen: Set<string>,
  fieldName: string,
  groupName: string | undefined,
): void {
  const key = JSON.stringify([fieldName, groupName]);
  if (seen.has(key)) return;
  seen.add(key);
  description.tests.push(groupName ? { fieldName, groupName } : { fieldName });
}

function addInclude(
  description: SuiteDescription,
  target: string,
  conditionRef: unknown,
): void {
  const condition = (conditionRef as { current?: unknown } | undefined)
    ?.current;
  if (isStringValue(condition)) {
    description.includes.push({ source: condition, target });
  } else {
    description.dynamicIncludes.push(target);
  }
}

function untestedTargets(
  relationships: Relationship[],
  tests: SuiteDescription['tests'],
): SchemaPath[] {
  const names = tests.map(test => test.fieldName.split('.'));
  const targets = new Map<string, SchemaPath>();
  for (const { target } of relationships) {
    targets.set(JSON.stringify(target), target);
  }
  return [...targets.values()].filter(
    target => !names.some(name => coversTarget(name, target)),
  );
}

// A test name covers a target when each segment matches: a key literally,
// and an item segment any array index or record key.
function coversTarget(name: string[], target: SchemaPath): boolean {
  return (
    name.length === target.length &&
    target.every((segment, index) =>
      typeof segment === 'string'
        ? segment === name[index]
        : segment.binding === 'record' || /^\d+$/.test(name[index]),
    )
  );
}
