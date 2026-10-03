/** Opt-in suite.changed() support. */
import {
  canPickRelationshipSchema,
  resolveAffected,
} from 'n4s/exports/relationships';

import {
  installChangedHandler,
  type ChangedPlan,
} from '../suite/changedHandler';
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
  if (!schema) return { only: selected, evaluated: null };
  if (!canPickRelationshipSchema(schema))
    return fullSchemaPlan(schema, data, selected);
  return pickedSchemaPlan(schema, data, selected, selection.schemaKeys);
}

function selectFields(
  schema: unknown,
  fields: readonly string[],
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
): { focus: string[]; schemaKeys: string[] } {
  const affected = isN4sSchema(schema)
    ? resolveAffected(schema, fields, data)
    : fields.map(field => [field]);
  const explicit = fieldList(modifiers.only);
  const skip = new Set(fieldList(modifiers.skip));
  const active = affected.filter(path => !isSkipped(path.join('.'), skip));
  return {
    focus: [
      ...new Set([...active.map(path => path.join('.')), ...explicit]),
    ].filter(field => !isSkipped(field, skip)),
    schemaKeys: [
      ...new Set([...active.map(path => String(path[0])), ...explicit]),
    ].filter(field => !skip.has(field)),
  };
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
): ChangedPlan {
  const schemaResults = runSchemaWithParse(schema, data, {});
  return {
    only: includeFailurePaths(only, schemaResults),
    schemaResults,
    evaluated: null,
  };
}

function pickedSchemaPlan(
  schema: { __schema: Record<string, unknown> },
  data: unknown,
  selected: string[],
  only: string[],
): ChangedPlan {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return fullSchemaPlan(schema, data, selected);
  }
  if (Object.keys(data).some(key => UNSAFE.has(key))) {
    return fullSchemaPlan(schema, data, selected);
  }
  const schemaKeys = new Set(Object.keys(schema.__schema));
  const validated = only.filter(key => schemaKeys.has(key));
  const schemaResults = runSelectedFields(schema.__schema, data, validated);
  const checked = new Set(validated);
  return {
    only: includeFailurePaths(selected, schemaResults),
    schemaResults,
    evaluated: path =>
      path === undefined ? validated.length > 0 : checked.has(path[0]),
  };
}

function includeFailurePaths(
  only: string[],
  results: SchemaRunResult[],
): string[] {
  const paths = results
    .filter(result => !result.pass)
    .map(result => result.path?.join('.') ?? '__root__');
  return [...new Set([...only, ...paths])];
}

function runSelectedFields(
  rules: Record<string, unknown>,
  data: object,
  keys: string[],
): SchemaRunResult[] {
  const failures: SchemaRunResult[] = [];
  const parsed = copyInput(data);
  for (const key of keys) {
    const value = Object.getOwnPropertyDescriptor(data, key)?.value;
    const rule = rules[key] as { run: (input: unknown) => SchemaRunResult };
    recordResult(key, rule.run(value), parsed, failures);
  }
  if (failures.length) return failures;
  return [{ pass: true, type: parsed }];
}

function recordResult(
  key: string,
  result: SchemaRunResult,
  parsed: Record<string, unknown>,
  failures: SchemaRunResult[],
): void {
  if (result.pass) parsed[key] = result.type;
  else failures.push({ ...result, path: [key, ...(result.path ?? [])] });
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
