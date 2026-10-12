import { asArray, hasOwnProperty } from 'vest-utils';
import { ctx as n4sContext } from 'n4s';

import { isNode } from './relationshipGraph';
import { meta } from './ruleMeta';
import {
  filterSchemaKeys,
  findDangerousOwnKey,
  isValidSchemaInput,
  ownKeys,
  safeShallowCopy,
} from './rules/schemaRules/schemaObjectUtils';
import type { RuleInstance } from './utils/RuleInstance';
import { RuleRunReturn } from './utils/RuleRunReturn';

export type RelationshipValidation = {
  results: RuleRunReturn<unknown>[];
  value?: Record<string, unknown>;
  evaluatedKeys: ReadonlySet<string>;
};
type Fields = Record<string, RuleInstance<unknown>>;
const fieldKeys = new WeakMap<object, Set<string>>();
// pick() and omit() validate like loose() over the keys they keep.
const keptFields = new WeakMap<object, Fields | null>();
// Use the package's existing context instance without moving the normal
// validator's context into a shared opt-in chunk (costly in CommonJS).
const ctx = n4sContext;

/**
 * n4s integration contract: validate selected top-level fields independently,
 * preserving the context and parsing semantics of shape(), loose(), pick()
 * and omit(). Return undefined when the complete schema must run instead.
 */
export function validateRelationshipFields(
  schema: unknown,
  fields: readonly string[],
  data: unknown,
): RelationshipValidation | undefined {
  const rules = selectableFields(schema);
  if (!rules || !canValidateFields(data, rules)) return;
  const available = availableFields(rules);
  if (!available) return;
  const keys = new Set(fields.filter(key => available.has(key)));
  return ctx.run({ value: data }, () => validateFields(rules, keys, data));
}

function availableFields(rules: object): Set<string> | undefined {
  let keys = fieldKeys.get(rules);
  if (!keys) {
    if (findDangerousOwnKey(rules)) return;
    keys = new Set(ownKeys(rules));
    fieldKeys.set(rules, keys);
  }
  return keys;
}

function selectableFields(schema: unknown): Fields | undefined {
  if (!isNode(schema)) return;
  const { kind, children, chained } = meta(schema);
  if (chained) return;
  return fieldsOf(schema, kind, (children as unknown[]) ?? []) ?? undefined;
}

function fieldsOf(
  schema: object,
  kind: string | undefined,
  args: unknown[],
): Fields | null | undefined {
  if (kind === 'shape' || kind === 'loose') return args[0] as Fields;
  if (kind === 'pick' || kind === 'omit')
    return keptFieldsOf(schema, kind, args);
}

function keptFieldsOf(
  schema: object,
  kind: 'pick' | 'omit',
  args: unknown[],
): Fields | null {
  let fields = keptFields.get(schema);
  if (fields === undefined) {
    const [shape, selection] = args;
    const keys = new Set(asArray(selection));
    // A dangerous key anywhere in the shape fails pick() and omit() as a
    // whole, so such a schema keeps running as a whole.
    fields =
      isNode(shape) && !findDangerousOwnKey(shape)
        ? filterSchemaKeys(shape as Fields, key =>
            kind === 'pick' ? keys.has(key) : !keys.has(key),
          )
        : null;
    keptFields.set(schema, fields);
  }
  return fields;
}

function canValidateFields(
  data: unknown,
  rules: object,
): data is Record<string, unknown> {
  return isValidSchemaInput(data, rules) && !findDangerousOwnKey(data);
}

function validateFields(
  rules: Fields,
  keys: Set<string>,
  data: Record<string, unknown>,
): RelationshipValidation {
  const input = safeShallowCopy(data);
  // When every input key is selected, the parsed callback input already is
  // the validated-only output. Reuse it instead of allocating a second copy.
  const value = selectedOutput(input, keys, data);
  const failures: RuleRunReturn<unknown>[] = [];
  for (const key of keys) {
    const raw = hasOwnProperty(data, key) ? data[key] : undefined;
    const result = ctx.run({ value: raw, set: true, meta: { key } }, () =>
      rules[key].run(raw),
    );
    if (result.pass) input[key] = value[key] = result.type;
    else failures.push(failureAt(key, result));
  }
  return failures.length
    ? { results: failures, evaluatedKeys: keys }
    : { results: [RuleRunReturn.Passing(input)], value, evaluatedKeys: keys };
}

function selectedOutput(
  input: Record<string, unknown>,
  keys: ReadonlySet<string>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  return ownKeys(data).every(key => keys.has(key)) ? input : {};
}

function failureAt(
  key: string,
  result: RuleRunReturn<unknown>,
): RuleRunReturn<unknown> {
  return { ...result, path: [key, ...(result.path ?? [])] };
}
