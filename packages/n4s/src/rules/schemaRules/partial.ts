import { ctx } from 'enforceContext';
import type { ShapeType } from 'shape';

import type { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

/**
 * Checks if value has any keys not present in schema.
 */
function hasExtraKeys<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): boolean {
  for (const key in value) {
    if (!(key in schema)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates provided keys against their schema rules.
 * Missing keys are allowed (partial validation).
 */
function validateProvidedKeys<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> | null {
  for (const key in schema) {
    if (key in value) {
      const fieldValue = value[key];
      const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
        schema[key].run(fieldValue),
      );
      if (!res.pass) {
        return res as RuleRunReturn<T>;
      }
    }
  }
  return null;
}

/**
 * partial(value, schema) validates that:
 * 1. value's keys are a subset of schema's keys (no extras)
 * 2. Zero or more keys may be present (empty object is allowed)
 * 3. For each provided key, the corresponding rule passes
 */
/**
 * Validates that an object partially matches a schema - schema keys are optional, no extra keys allowed.
 * All provided keys must exist in schema and pass their validation rules.
 * Missing keys are allowed (making all fields optional).
 *
 * @template T - The object type to validate
 * @param value - The object to validate
 * @param schema - Schema mapping keys to validation rules
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce({ name: 'John' })
 *   .partial({
 *     name: enforce.isString(),
 *     age: enforce.isNumber(),
 *     email: enforce.isString()
 *   }); // passes (age and email are optional)
 *
 * // Lazy API
 * const updateSchema = enforce.partial({
 *   name: enforce.isString(),
 *   email: enforce.isString().matches(/@/),
 *   age: enforce.isNumber()
 * });
 *
 * updateSchema.test({}); // true (all fields optional)
 * updateSchema.test({ name: 'Jane' }); // true (partial update)
 * updateSchema.test({ name: 'Jane', email: 'jane@example.com' }); // true
 * updateSchema.test({ name: 'Jane', extra: 'x' }); // false (extra key not in schema)
 * ```
 */
export function partial<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  if (hasExtraKeys(value, schema)) {
    return RuleRunReturn.Failing(value);
  }

  const validationResult = validateProvidedKeys(value, schema);
  if (validationResult) {
    return validationResult;
  }

  return RuleRunReturn.Passing(value);
}

// Types colocated with partial rule
export type PartialRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<Partial<ShapeType<S>>, [Partial<ShapeType<S>>]>;

export type PartialShapeValue<S extends Record<string, RuleInstance<any>>> =
  Partial<ShapeType<S>>;
