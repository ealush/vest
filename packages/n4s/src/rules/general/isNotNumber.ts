/**
 * Validates that a value is not a number (or is NaN).
 * Inverse of isNumber. Considers NaN as not a number.
 *
 * @param value - Value to validate
 * @returns True if value is not a number or is NaN
 *
 * @example
 * ```typescript
 * enforce('123').isNotNumber(); // passes
 * enforce(NaN).isNotNumber(); // passes
 * enforce(true).isNotNumber(); // passes
 * enforce(42).isNotNumber(); // fails
 * ```
 */
export function isNotNumber(value: any): boolean {
  return typeof value !== 'number' || Number.isNaN(value);
}
