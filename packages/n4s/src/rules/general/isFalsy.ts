/**
 * Module: `src/rules/general/isFalsy.ts`.
 *
 * Provides `isFalsy`-related runtime and type utilities used by `n4s`.
 */
// Validates that a value is falsy (false, 0, '', null, undefined, or NaN)
export function isFalsy(value: any): boolean {
  return !value;
}
