import { isNumeric as isNumericValue } from 'vest-utils';

/**
 * Validates that a value is not numeric (not a number or numeric string).
 * Inverse of isNumeric.
 *
 * @param value - Value to validate
 * @returns True if value is not numeric
 *
 * @example
 * ```typescript
 * enforce('hello').isNotNumeric(); // passes
 * enforce(true).isNotNumeric(); // passes
 * enforce(NaN).isNotNumeric(); // passes
 * enforce(42).isNotNumeric(); // fails
 * enforce('42').isNotNumeric(); // fails
 * ```
 */
export function isNotNumeric(value: any): boolean {
  // Accept numbers (including Infinity) and numeric strings as numeric
  if (typeof value === 'number') {
    // Only NaN is not numeric among numbers
    return Number.isNaN(value);
  }
  // For strings, use the vest-utils isNumeric which excludes Infinity strings
  return !isNumericValue(value);
}
