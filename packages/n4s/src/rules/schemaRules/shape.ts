/**
 * Module: `src/rules/schemaRules/shape.ts`.
 *
 * Provides `shape`-related runtime and type utilities used by `n4s`.
 */
import { hasOwnProperty } from 'vest-utils';

import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

import { loose } from './loose';
import { ownKeys } from './schemaObjectUtils';

// Types colocated with shape rule
import type { InferShape, SchemaInfer, SchemaInput } from './schemaRulesTypes';

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
 *   .shape({
 *     name: enforce.isString(),
 *     age: enforce.isNumber().greaterThan(0)
 *   }); // passes
 *
 * // Lazy API
 * const userSchema = enforce.shape({
 *   name: enforce.isString(),
 *   email: enforce.isString().matches(/@/),
 *   age: enforce.isNumber().greaterThanOrEquals(18)
 * });
 *
 * userSchema.test({ name: 'Jane', email: 'jane@example.com', age: 25 }); // true
 * userSchema.test({ name: 'Jane', age: 25 }); // false (missing email)
 * userSchema.test({ name: 'Jane', email: 'jane@example.com', age: 25, extra: 'x' }); // false (extra key)
 * ```
 */
export function shape<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  const baseRes = loose(value, schema);
  if (!baseRes.pass) {
    return baseRes;
  }

  for (const key of ownKeys(value)) {
    if (!hasOwnProperty(schema, key)) {
      const res = RuleRunReturn.Failing(value);
      const newRes = { ...res, path: [key] };
      return newRes;
    }
  }

  return RuleRunReturn.Passing(baseRes.type);
}

export type { InferShape, SchemaInfer };

export type ShapeType<T extends Record<string, RuleInstance<any>>> =
  SchemaInfer<T>;

export type ShapeInputType<T extends Record<string, RuleInstance<any>>> =
  SchemaInput<T>;

export type ShapeRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<ShapeType<S>, [ShapeInputType<S>]>;

export type ShapeValue<S extends Record<string, RuleInstance<any>>> =
  ShapeType<S>;

export type SchemaValidationRule = <T extends Record<string, any>>(
  value: T,
  schema: Record<string, RuleInstance<any>>,
) => RuleRunReturn<T>;
