import { isStringValue } from 'vest-utils';

export function toRegExp(regex: RegExp | string): RegExp | null {
  if (regex instanceof RegExp) return regex;
  if (isStringValue(regex)) return new RegExp(regex);
  return null;
}
