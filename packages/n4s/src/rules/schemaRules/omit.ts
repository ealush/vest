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

  const omitKeys = Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit];

  const dangerousKeyError = checkDangerousKeys(value, schema);
  if (dangerousKeyError) {
    return dangerousKeyError;
  }

  const omittedSchema = buildOmittedSchema(schema, omitKeys);

  const baseRes = loose(value, omittedSchema);
  if (!baseRes.pass) {
    return baseRes;
  }

  return RuleRunReturn.Passing(
    buildOmittedResult(baseRes.type, omitKeys, value) as T,
  );
}

function buildOmittedSchema(
  schema: Record<string, any>,
  omitKeys: string[],
): Record<string, any> {
  const omittedSchema: Record<string, any> = {};
  for (const key of ownKeys(schema)) {
    if (!omitKeys.includes(key)) {
      omittedSchema[key] = schema[key];
    }
  }
  return omittedSchema;
}

function buildOmittedResult(
  validatedValue: Record<string, any>,
  omitKeys: string[],
  originalValue: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = safeShallowCopy(originalValue);
  for (const key of ownKeys(validatedValue)) {
    if (!omitKeys.includes(key)) {
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

export type OmitRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<any, [S, string[] | string]>;
