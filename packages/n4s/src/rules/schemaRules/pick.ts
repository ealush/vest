import { isObject } from 'vest-utils';

import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';
import { ownKeys, checkDangerousKeys } from './schemaObjectUtils';
import { loose } from './loose';

/**
 * Validates that an object loosely matches a schema but only validates the specified keys.
 * Other keys in the object are ignored and no validation is applied to them.
 *
 * @template T - The object type to validate
 * @param value - The object to validate
 * @param schema - Schema mapping keys to validation rules
 * @param keysToPick - Array of keys that should be validated from the schema
 * @returns RuleRunReturn indicating success or failure
 */
export function pick<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
  keysToPick: string[] | string,
): RuleRunReturn<T> {
  if (!isObject(value)) {
    return RuleRunReturn.Failing(value);
  }

  const pickKeys = new Set(
    Array.isArray(keysToPick) ? keysToPick : [keysToPick],
  );

  const dangerousKeyError = checkDangerousKeys(value, schema);
  if (dangerousKeyError) {
    return { ...RuleRunReturn.Failing(value), ...dangerousKeyError };
  }

  const pickedSchema = buildPickedSchema(schema, pickKeys);

  // Use `loose` so we only care about validating our picked subset of schema rules
  // without failing if the object has extra unspecified fields.
  const baseRes = loose(value, pickedSchema);
  return baseRes.pass ? RuleRunReturn.Passing(baseRes.type as T) : baseRes;
}

function buildPickedSchema(
  schema: Record<string, any>,
  pickKeys: Set<string>,
): Record<string, any> {
  const pickedSchema: Record<string, any> = {};
  if (!isObject(schema)) {
    return pickedSchema;
  }
  for (const key of ownKeys(schema)) {
    if (pickKeys.has(key)) {
      pickedSchema[key] = schema[key];
    }
  }
  return pickedSchema;
}

export type PickRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<any, [S, string[] | string]>;
