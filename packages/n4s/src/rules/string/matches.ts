/**
 * Module: `src/rules/string/matches.ts`.
 *
 * Provides `matches`-related runtime and type utilities used by `n4s`.
 */
import { toRegExp } from '../../utils/regex';

// Checks if string matches the given regular expression pattern
export function matches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && r.test(str);
}
