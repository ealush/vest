import { toRegExp } from '../../utils/regex';

// Checks if string matches the given regular expression pattern
export function matches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && r.test(str);
}
