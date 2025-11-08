/**
 * Validates that a value is an array.
 * Type guard that narrows the type to any[].
 * 
 * @param value - Value to validate
 * @returns True if value is an array
 * 
 * @example
 * ```typescript
 * // Eager API
 * enforce([1, 2, 3]).isArray(); // passes
 * enforce('hello').isArray(); // fails
 * 
 * // Lazy API
 * const arrayRule = enforce.isArray();
 * arrayRule.test([1, 2]); // true
 * arrayRule.test({}); // false
 * ```
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}
