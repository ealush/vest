function toRegExp(regex: RegExp | string): RegExp | null {
  if (regex instanceof RegExp) return regex;
  if (typeof regex === 'string') return new RegExp(regex);
  return null;
}

export function matches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && r.test(str);
}
