/**
 * Validates that a value is not a boolean.
 * Inverse of isBoolean.
 *
 * @param value - Value to validate
 * @returns True if value is not a boolean
 *
 * @example
 * ```typescript
 * enforce(1).isNotBoolean(); // passes
 * enforce('true').isNotBoolean(); // passes
 * enforce(true).isNotBoolean(); // fails
 * enforce(false).isNotBoolean(); // fails
 * ```
 */
export function isNotBoolean(value: any): boolean {
  return typeof value !== 'boolean';
}
