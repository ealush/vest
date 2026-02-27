/**
 * Module: `src/rules/boolean/isBoolean.ts`.
 *
 * Provides `isBoolean`-related runtime and type utilities used by `n4s`.
 */
import { isBoolean as isBooleanValue } from 'vest-utils';

/**
 * Validates that a value is a boolean.
 * Type guard that narrows the type to boolean.
 *
 * @param value - Value to validate
 * @returns True if value is a boolean
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(true).isBoolean(); // passes
 * enforce(false).isBoolean(); // passes
 * enforce(1).isBoolean(); // fails
 * enforce('true').isBoolean(); // fails
 *
 * // Lazy API
 * const boolRule = enforce.isBoolean();
 * boolRule.test(true); // true
 * boolRule.test(0); // false
 *
 * // Chains with boolean-specific rules
 * enforce(true).isBoolean().isTrue();
 * ```
 */
export function isBoolean(value: any): value is boolean {
  return isBooleanValue(value);
}
