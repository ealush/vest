/**
 * Module: `src/rules/general/isNotEmpty.ts`.
 *
 * Provides `isNotEmpty`-related runtime and type utilities used by `n4s`.
 */
import { isNotEmpty as isNotEmptyValue } from 'vest-utils';

// Checks if value is not empty (not null, undefined, empty string, empty array, or empty object)
export function isNotEmpty(value: any): boolean {
  return isNotEmptyValue(value);
}
