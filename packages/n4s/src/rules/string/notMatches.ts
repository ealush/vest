/**
 * Module: `src/rules/string/notMatches.ts`.
 *
 * Provides `notMatches`-related runtime and type utilities used by `n4s`.
 */
import { toRegExp } from '../../utils/regex';

// Checks if string does not match the given regular expression pattern
export function notMatches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && !r.test(str);
}
