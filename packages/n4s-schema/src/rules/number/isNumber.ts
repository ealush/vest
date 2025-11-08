/**
 * Validates that a value is a number (excluding NaN).
 * Type guard that narrows the type to number.
 * 
 * @param value - Value to validate
 * @returns True if value is a number and not NaN
 * 
 * @example
 * ```typescript
 * // Eager API
 * enforce(42).isNumber(); // passes
 * enforce('42').isNumber(); // fails (string)
 * enforce(NaN).isNumber(); // fails (NaN is excluded)
 * 
 * // Lazy API
 * const numberRule = enforce.isNumber();
 * numberRule.test(42); // true
 * numberRule.test(Infinity); // true
 * numberRule.test(NaN); // false
 * 
 * // Chains with number-specific rules
 * enforce(25).isNumber().greaterThan(18);
 * ```
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}
