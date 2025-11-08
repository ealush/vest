/**
 * Validates that a value is not an array.
 * Inverse of isArray.
 *
 * @param value - Value to validate
 * @returns True if value is not an array
 *
 * @example
 * ```typescript
 * enforce({}).isNotArray(); // passes
 * enforce('hello').isNotArray(); // passes
 * enforce([1, 2, 3]).isNotArray(); // fails
 * ```
 */
export function isNotArray(value: any): boolean {
  return !Array.isArray(value);
}
