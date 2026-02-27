/**
 * Module: `src/rules/string/isNotBlank.ts`.
 *
 * Provides `isNotBlank`-related runtime and type utilities used by `n4s`.
 */
// Checks if string contains non-whitespace characters
export function isNotBlank(str: string): boolean {
  return str.trim().length > 0;
}
