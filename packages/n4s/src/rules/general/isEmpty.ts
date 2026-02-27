/**
 * Module: `src/rules/general/isEmpty.ts`.
 *
 * Provides `isEmpty`-related runtime and type utilities used by `n4s`.
 */
import { isEmpty as isEmptyValue } from 'vest-utils';

// Validates that a value is empty (empty string, array, object, null, or undefined)
export function isEmpty(value: any): boolean {
  return isEmptyValue(value);
}
