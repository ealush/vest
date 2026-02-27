/**
 * Module: `src/rules/general/isTruthy.ts`.
 *
 * Provides `isTruthy`-related runtime and type utilities used by `n4s`.
 */
// Validates that a value is truthy (not false, 0, '', null, undefined, or NaN)
export function isTruthy(value: any): boolean {
  return !!value;
}
