/**
 * Module: `src/rules/general/notEquals.ts`.
 *
 * Provides `notEquals`-related runtime and type utilities used by `n4s`.
 */
// Validates that two values are not strictly equal (!==)
export function notEquals<T>(value: T, v: T): boolean {
  return value !== v;
}
