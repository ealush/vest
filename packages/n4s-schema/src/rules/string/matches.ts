import { toRegExp } from 'regex';

export function matches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && r.test(str);
}
