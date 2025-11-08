import { isNumeric as isNumericValue } from 'vest-utils';

/**
 * Validates that a value is numeric (a number or a numeric string).
 * Type guard that narrows the type to number | string.
 * Excludes NaN but includes Infinity and numeric strings.
 *
 * @param value - Value to validate
 * @returns True if value is a number or numeric string
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(42).isNumeric(); // passes
 * enforce('42').isNumeric(); // passes (numeric string)
 * enforce('42.5').isNumeric(); // passes
 * enforce(Infinity).isNumeric(); // passes
 * enforce('hello').isNumeric(); // fails
 * enforce(NaN).isNumeric(); // fails
 *
 * // Lazy API
 * const numericRule = enforce.isNumeric();
 * numericRule.test(100); // true
 * numericRule.test('100'); // true
 * numericRule.test('abc'); // false
 *
 * // Chains with numeric comparison rules
 * enforce('25').isNumeric().greaterThan(18);
 * ```
 */
export function isNumeric(value: any): value is number | string {
  // Accept numbers (including Infinity) and numeric strings
  if (typeof value === 'number') {
    return !Number.isNaN(value);
  }
  // For strings, use the vest-utils isNumeric which excludes Infinity strings
  return isNumericValue(value);
}
