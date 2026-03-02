import { isObject } from 'vest-utils';

import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';
import { ownKeys, checkDangerousKeys } from './schemaObjectUtils';
import { loose } from './loose';

/**
 * Validates that an object loosely matches a schema but omits specified keys from validation.
 * The omitted keys in the object are ignored and no validation is applied to them.
 *
 * @template T - The object type to validate
 * @param value - The object to validate
 * @param schema - Schema mapping keys to validation rules
 * @param keysToOmit - Array of keys that should be omitted from schema validation
 * @returns RuleRunReturn indicating success or failure
 */
export function omit<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
  keysToOmit: string[] | string,
): RuleRunReturn<T> {
  if (!isObject(value)) {
    return RuleRunReturn.Failing(value);
  }

  const omitKeys = new Set(
    Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit],
  );

  const dangerousKeyError = checkDangerousKeys(value, schema);
  if (dangerousKeyError) {
    return { ...RuleRunReturn.Failing(value), ...dangerousKeyError };
  }

  const omittedSchema = buildOmittedSchema(schema, omitKeys);

  const baseRes = loose(value, omittedSchema);
  return baseRes.pass ? RuleRunReturn.Passing(baseRes.type as T) : baseRes;
}

function buildOmittedSchema(
  schema: Record<string, any>,
  omitKeys: Set<string>,
): Record<string, any> {
  const omittedSchema: Record<string, any> = {};
  if (!isObject(schema)) {
    return omittedSchema;
  }
  for (const key of ownKeys(schema)) {
    if (!omitKeys.has(key)) {
      omittedSchema[key] = schema[key];
    }
  }
  return omittedSchema;
}

export type OmitRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<any, [S, string[] | string]>;
