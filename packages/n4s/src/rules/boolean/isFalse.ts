/**
 * Module: `src/rules/boolean/isFalse.ts`.
 *
 * Provides `isFalse`-related runtime and type utilities used by `n4s`.
 */
// Checks if value is strictly equal to false
export function isFalse(value: boolean): boolean {
  return value === false;
}
