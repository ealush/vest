/**
 * Module: `src/rules/general/isNotNaN.ts`.
 *
 * Provides `isNotNaN`-related runtime and type utilities used by `n4s`.
 */
import { toNumber } from 'vest-utils';

// Validates that a value is not NaN
export function isNotNaN(value: any): boolean {
  return !Number.isNaN(toNumber(value).unwrapOr(value));
}
