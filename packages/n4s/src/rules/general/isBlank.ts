/**
 * Module: `src/rules/general/isBlank.ts`.
 *
 * Provides `isBlank`-related runtime and type utilities used by `n4s`.
 */
import { BlankValue, isNullish, isStringValue } from 'vest-utils';

export function isBlank(value: unknown): value is BlankValue {
  return isNullish(value) || (isStringValue(value) && !value.trim());
}

export function isNotBlank(value: unknown): boolean {
  return !isBlank(value);
}
