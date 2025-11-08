import { isStringValue } from 'vest-utils';

/**
 * Validates that a value is a string.
 * Type guard that narrows the type to string.
 * 
 * @param value - Value to validate
 * @returns True if value is a string
 * 
 * @example
 * ```typescript
 * // Eager API
 * enforce('hello').isString(); // passes
 * enforce(123).isString(); // fails
 * 
 * // Lazy API
 * const stringRule = enforce.isString();
 * stringRule.test('hello'); // true
 * 
 * // Chains with string-specific rules
 * enforce('hello').isString().longerThan(3);
 * ```
 */
export function isString(value: any): value is string {
  return isStringValue(value);
}
