/**
 * Module: `src/rules/general/isNotUndefined.ts`.
 *
 * Provides `isNotUndefined`-related runtime and type utilities used by `n4s`.
 */
import { isNotUndefined as isNotUndefinedValue } from 'vest-utils';

/**
 * Validates that a value is not undefined.
 * Inverse of isUndefined. Note: null passes this check.
 *
 * @param value - Value to validate
 * @returns True if value is not undefined
 *
 * @example
 * ```typescript
 * enforce(null).isNotUndefined(); // passes
 * enforce(0).isNotUndefined(); // passes
 * enforce('').isNotUndefined(); // passes
 * enforce(undefined).isNotUndefined(); // fails
 * ```
 */
export function isNotUndefined(value: any): boolean {
  return isNotUndefinedValue(value);
}
