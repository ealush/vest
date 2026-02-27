/**
 * Module: `src/rules/string/endsWith.ts`.
 *
 * Provides `endsWith`-related runtime and type utilities used by `n4s`.
 */
// Checks if string ends with the given suffix
export function endsWith(str: string, ending: string): boolean {
  return str.endsWith(ending);
}
