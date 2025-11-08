/**
 * Validates that a value is not a string.
 * Inverse of isString.
 * 
 * @param value - Value to validate
 * @returns True if value is not a string
 * 
 * @example
 * ```typescript
 * enforce(123).isNotString(); // passes
 * enforce([]).isNotString(); // passes
 * enforce('hello').isNotString(); // fails
 * ```
 */
export function isNotString(value: any): boolean {
  return typeof value !== 'string';
}
