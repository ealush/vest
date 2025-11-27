import { describe, it, expect } from 'vitest';

import { toRegExp } from '../regex';

describe('toRegExp', () => {
  it('returns RegExp unchanged', () => {
    const regex = /test/;
    expect(toRegExp(regex)).toBe(regex);
  });

  it('converts string to RegExp', () => {
    const result = toRegExp('test');
    expect(result).toBeInstanceOf(RegExp);
    expect(result?.source).toBe('test');
  });

  it('handles regex patterns with flags as string', () => {
    const result = toRegExp('[0-9]+');
    expect(result).toBeInstanceOf(RegExp);
    expect('123'.match(result!)).toBeTruthy();
  });

  it('returns null for invalid inputs', () => {
    expect(toRegExp(123 as any)).toBe(null);
    expect(toRegExp({} as any)).toBe(null);
    expect(toRegExp(null as any)).toBe(null);
  });
});
