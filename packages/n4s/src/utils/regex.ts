export function toRegExp(regex: RegExp | string): RegExp | null {
  if (regex instanceof RegExp) return regex;
  if (typeof regex === 'string') return new RegExp(regex);
  return null;
}
