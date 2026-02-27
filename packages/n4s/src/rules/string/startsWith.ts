/**
 * Module: `src/rules/string/startsWith.ts`.
 *
 * Provides `startsWith`-related runtime and type utilities used by `n4s`.
 */
// Checks if string starts with the given prefix
export function startsWith(str: string, start: string): boolean {
  return str.startsWith(start);
}
