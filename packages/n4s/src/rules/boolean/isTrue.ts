/**
 * Module: `src/rules/boolean/isTrue.ts`.
 *
 * Provides `isTrue`-related runtime and type utilities used by `n4s`.
 */
// Checks if value is strictly equal to true
export function isTrue(value: boolean): boolean {
  return value === true;
}
