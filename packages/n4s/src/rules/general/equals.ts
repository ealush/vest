/**
 * Module: `src/rules/general/equals.ts`.
 *
 * Provides `equals`-related runtime and type utilities used by `n4s`.
 */
// Validates that two values are strictly equal (===)
export function equals<T>(value: T, v: T): boolean {
  return value === v;
}
