import { isNullish as isNullishValue } from 'vest-utils';

/**
 * Validates that a value is null or undefined (nullish).
 * Type guard that narrows the type to null | undefined.
 *
 * @param value - Value to validate
 * @returns True if value is null or undefined
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(null).isNullish(); // passes
 * enforce(undefined).isNullish(); // passes
 * enforce(0).isNullish(); // fails
 * enforce('').isNullish(); // fails
 * enforce(false).isNullish(); // fails
 *
 * // Lazy API
 * const nullishRule = enforce.isNullish();
 * nullishRule.test(null); // true
 * nullishRule.test(undefined); // true
 * nullishRule.test(0); // false
 * ```
 */
export function isNullish(value: any): value is null | undefined {
  return isNullishValue(value);
}
