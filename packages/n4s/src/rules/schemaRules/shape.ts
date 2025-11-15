import { hasOwnProperty } from 'vest-utils';

import type { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';
import { loose } from 'loose';
import type { ShapeType } from 'schemaRulesTypes'; // [FIXED] Import, don't redeclare

/**
 * Validates that an object matches a schema exactly - all keys required, no extra keys allowed.
 * Each field value is validated against its corresponding RuleInstance in the schema.
 *
 * @template T - The object type to validate
 * @param value - The object to validate
 * @param schema - Schema mapping keys to validation rules
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce({ name: 'John', age: 30 })
 * .shape({
 * name: enforce.isString(),
 * age: enforce.isNumber().greaterThan(0)
 * }); // passes
 *
 * // Lazy API
 * const userSchema = enforce.shape({
 * name: enforce.isString(),
 * email: enforce.isString().matches(/@/),
 * age: enforce.isNumber().greaterThanOrEquals(18)
 * });
 *
 * userSchema.test({ name: 'Jane', email: 'jane@example.com', age: 25 }); // true
 * userSchema.test({ name: 'Jane', age: 25 }); // false (missing email)
 * userSchema.test({ name: 'Jane', email: 'jane@example.com', age: 25, extra: 'x' }); // false (extra key)
 * ```
 */
export function shape<T extends Record<string, any>>(
  value: T,
  schema: Record<string, RuleInstance<any, any[]>>, // [FIXED]
): RuleRunReturn<T> {
  const baseRes = loose(value, schema);
  if (!baseRes.pass) {
    return baseRes;
  }

  for (const key in value) {
    if (!hasOwnProperty(schema, key)) {
      return RuleRunReturn.Failing(value);
    }
  }

  return RuleRunReturn.Passing(value);
}

// Types colocated with shape rule
// [FIXED] Removed duplicated InferShape, SchemaInfer, and ShapeType

export type ShapeRuleInstance<
  S extends Record<string, RuleInstance<any, any[]>>, // [FIXED]
> = RuleInstance<ShapeType<S>, [ShapeType<S>]>;

export type ShapeValue<
  S extends Record<string, RuleInstance<any, any[]>>, // [FIXED]
> = ShapeType<S>;

export type SchemaValidationRule = <T extends Record<string, any>>(
  value: T,
  schema: Record<string, RuleInstance<any, any[]>>, // [FIXED]
) => RuleRunReturn<T>;
