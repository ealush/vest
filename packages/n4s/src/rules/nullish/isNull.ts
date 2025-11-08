import { isNull as isNullValue } from 'vest-utils';

/**
 * Validates that a value is null.
 * Type guard that narrows the type to null.
 *
 * @param value - Value to validate
 * @returns True if value is null
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(null).isNull(); // passes
 * enforce(undefined).isNull(); // fails
 * enforce(0).isNull(); // fails
 *
 * // Lazy API
 * const nullRule = enforce.isNull();
 * nullRule.test(null); // true
 * nullRule.test(undefined); // false
 * ```
 */
export function isNull(value: any): value is null {
  return isNullValue(value);
}
