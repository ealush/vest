import { isNotNullish as isNotNullishValue } from 'vest-utils';

/**
 * Validates that a value is not nullish (not null and not undefined).
 * Inverse of isNullish.
 *
 * @param value - Value to validate
 * @returns True if value is neither null nor undefined
 *
 * @example
 * ```typescript
 * enforce(0).isNotNullish(); // passes
 * enforce('').isNotNullish(); // passes
 * enforce(false).isNotNullish(); // passes
 * enforce(null).isNotNullish(); // fails
 * enforce(undefined).isNotNullish(); // fails
 * ```
 */
export function isNotNullish(value: any): boolean {
  return isNotNullishValue(value);
}
