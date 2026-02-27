/**
 * Module: `src/rules/number/isPositive.ts`.
 *
 * Provides `isPositive`-related runtime and type utilities used by `n4s`.
 */
// Checks if number is greater than zero
export function isPositive(value: number): boolean {
  return value > 0;
}
