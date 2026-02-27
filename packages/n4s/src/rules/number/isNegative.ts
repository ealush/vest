/**
 * Module: `src/rules/number/isNegative.ts`.
 *
 * Provides `isNegative`-related runtime and type utilities used by `n4s`.
 */
// Checks if number is less than zero
export function isNegative(value: number): boolean {
  return value < 0;
}
