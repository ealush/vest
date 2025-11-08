import { isNotNull as isNotNullValue } from 'vest-utils';

/**
 * Validates that a value is not null.
 * Inverse of isNull. Note: undefined passes this check.
 * 
 * @param value - Value to validate
 * @returns True if value is not null
 * 
 * @example
 * ```typescript
 * enforce(undefined).isNotNull(); // passes
 * enforce(0).isNotNull(); // passes
 * enforce('').isNotNull(); // passes
 * enforce(null).isNotNull(); // fails
 * ```
 */
export function isNotNull(value: any): boolean {
  return isNotNullValue(value);
}
