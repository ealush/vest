/**
 * Module: `src/rules/number/isNotBetween.ts`.
 *
 * Provides `isNotBetween`-related runtime and type utilities used by `n4s`.
 */
export function isNotBetween(value: number, min: number, max: number): boolean {
  return value < min || value > max;
}
