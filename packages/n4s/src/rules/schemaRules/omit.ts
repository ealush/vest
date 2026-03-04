import { asArray } from 'vest-utils';

import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';
import {
  checkDangerousKeys,
  filterSchemaKeys,
  isValidSchemaInput,
} from './schemaObjectUtils';
import { loose } from './loose';
import type { ShapeType, ShapeInputType } from './shape';

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
  if (!isValidSchemaInput(value, schema)) {
    return RuleRunReturn.Failing(value);
  }

  const omitKeys = new Set(asArray(keysToOmit));

  const dangerousKeyError = checkDangerousKeys(value, schema);
  if (dangerousKeyError) {
    return { ...RuleRunReturn.Failing(value), ...dangerousKeyError };
  }

  const omittedSchema = filterSchemaKeys(schema, key => !omitKeys.has(key));

  const baseRes = loose(value, omittedSchema);
  return baseRes.pass ? RuleRunReturn.Passing(baseRes.type as T) : baseRes;
}

export type OmitRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<ShapeType<S>, [ShapeInputType<S>]>;
