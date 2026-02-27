/**
 * Module: `src/rules/schemaRules/optional.ts`.
 *
 * Provides `optional`-related runtime and type utilities used by `n4s`.
 */
import { isNullish } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Makes a validation rule optional by allowing null or undefined values to pass.
 * If the value is null or undefined, validation passes without running the inner rule.
 * Otherwise, the inner rule is executed.
 *
 * @template T - The value type to validate
 * @param value - The value to validate (may be null/undefined)
 * @param rule - The RuleInstance to apply if value is not nullish
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(undefined).optional(enforce.isString()); // passes
 * enforce(null).optional(enforce.isString()); // passes
 * enforce('hello').optional(enforce.isString()); // passes
 * enforce(123).optional(enforce.isString()); // fails
 *
 * // Lazy API - useful in schemas
 * const userSchema = enforce.shape({
 *   name: enforce.isString(),
 *   middleName: enforce.optional(enforce.isString()),
 *   age: enforce.isNumber()
 * });
 *
 * userSchema.test({ name: 'John', age: 30 }); // true (middleName optional)
 * userSchema.test({ name: 'John', middleName: null, age: 30 }); // true
 * userSchema.test({ name: 'John', middleName: 'Q', age: 30 }); // true
 * userSchema.test({ name: 'John', middleName: 123, age: 30 }); // false
 * ```
 */
export function optional<T>(
  value: T | undefined | null,
  rule: any,
): RuleRunReturn<T | undefined | null> {
  if (isNullish(value)) {
    return RuleRunReturn.Passing(value);
  }
  return rule.run(value);
}

// Type for optional rule instance
export type OptionalRuleInstance<T> = RuleInstance<
  T | undefined | null,
  [T | undefined | null]
>;
