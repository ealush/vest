/**
 * Module: `src/rules/nullish/isUndefined.ts`.
 *
 * Provides `isUndefined`-related runtime and type utilities used by `n4s`.
 */
import { isUndefined as isUndefinedValue } from 'vest-utils';

/**
 * Validates that a value is undefined.
 * Type guard that narrows the type to undefined.
 *
 * @param value - Value to validate
 * @returns True if value is undefined
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(undefined).isUndefined(); // passes
 * enforce(null).isUndefined(); // fails
 * enforce('').isUndefined(); // fails
 *
 * // Lazy API
 * const undefRule = enforce.isUndefined();
 * undefRule.test(undefined); // true
 * undefRule.test(null); // false
 *
 * // Useful for optional properties
 * const schema = enforce.shape({
 *   optional: enforce.optional(enforce.isString())
 * });
 * ```
 */
export function isUndefined(value: any): value is undefined {
  return isUndefinedValue(value);
}
