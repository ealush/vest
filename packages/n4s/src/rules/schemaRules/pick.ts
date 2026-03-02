import { isObject } from 'vest-utils';

import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';
import {
  findDangerousOwnKey,
  ownKeys,
  safeShallowCopy,
} from './schemaObjectUtils';
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

  const pickKeys = Array.isArray(keysToPick) ? keysToPick : [keysToPick];

  const dangerousKeyError = checkDangerousKeys(value, schema);
  if (dangerousKeyError) {
    return dangerousKeyError;
  }

  const pickedSchema = buildPickedSchema(schema, pickKeys);

  // Use `loose` so we only care about validating our picked subset of schema rules
  // without failing if the object has extra unspecified fields.
  const baseRes = loose(value, pickedSchema);
  if (!baseRes.pass) {
    return baseRes;
  }

  return RuleRunReturn.Passing(
    buildPickedResult(baseRes.type, pickKeys, value) as T,
  );
}

function buildPickedSchema(
  schema: Record<string, any>,
  pickKeys: string[],
): Record<string, any> {
  const pickedSchema: Record<string, any> = {};
  for (const key of ownKeys(schema)) {
    if (pickKeys.includes(key)) {
      pickedSchema[key] = schema[key];
    }
  }
  return pickedSchema;
}

function buildPickedResult(
  validatedValue: Record<string, any>,
  pickKeys: string[],
  originalValue: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = safeShallowCopy(originalValue);
  for (const key of ownKeys(validatedValue)) {
    if (pickKeys.includes(key)) {
      result[key] = validatedValue[key];
    }
  }
  return result;
}

function checkDangerousKeys<T>(value: T, schema: Record<string, any>) {
  const dangerousSchemaKey = findDangerousOwnKey(schema);
  if (dangerousSchemaKey) {
    return { ...RuleRunReturn.Failing(value), path: [dangerousSchemaKey] };
  }

  const dangerousValueKey = findDangerousOwnKey(value);
  if (dangerousValueKey) {
    return { ...RuleRunReturn.Failing(value), path: [dangerousValueKey] };
  }

  return null;
}

export type PickRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<any, [S, string[] | string]>;
