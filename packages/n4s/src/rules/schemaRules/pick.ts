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
  if (!isValidSchemaInput(value, schema)) {
    return RuleRunReturn.Failing(value);
  }

  const pickKeys = new Set(
    Array.isArray(keysToPick) ? keysToPick : [keysToPick],
  );

  const dangerousKeyError = checkDangerousKeys(value, schema);
  if (dangerousKeyError) {
    return { ...RuleRunReturn.Failing(value), ...dangerousKeyError };
  }

  const pickedSchema = filterSchemaKeys(schema, key => pickKeys.has(key));

  // Use `loose` so we only care about validating our picked subset of schema rules
  // without failing if the object has extra unspecified fields.
  const baseRes = loose(value, pickedSchema);
  return baseRes.pass ? RuleRunReturn.Passing(baseRes.type as T) : baseRes;
}

export type PickRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<ShapeType<S>, [ShapeInputType<S>]>;
