import { describe, it, expect } from 'vitest';

import { toRegExp } from '../regex';
import { toNumber } from '../toNumber';

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

describe('toNumber', () => {
  it('returns number unchanged', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-5)).toBe(-5);
    expect(toNumber(3.14)).toBe(3.14);
  });

  it('converts numeric string to number', () => {
    expect(toNumber('42')).toBe(42);
    expect(toNumber('3.14')).toBe(3.14);
    expect(toNumber('-5')).toBe(-5);
    expect(toNumber('0')).toBe(0);
  });

  it('returns null for non-numeric values', () => {
    expect(toNumber('not a number')).toBe(null);
    expect(toNumber('abc')).toBe(null);
    expect(toNumber({})).toBe(null);
    expect(toNumber(undefined)).toBe(null);
  });

  it('handles NaN correctly', () => {
    // NaN is technically a number type, so toNumber returns it as-is
    const result = toNumber(NaN);
    expect(Number.isNaN(result)).toBe(true);
  });

  it('handles edge cases', () => {
    expect(toNumber('')).toBe(0); // Empty string converts to 0
    expect(toNumber('   ')).toBe(0); // Whitespace converts to 0
    expect(toNumber(true)).toBe(1);
    expect(toNumber(false)).toBe(0);
    expect(toNumber([])).toBe(0); // Empty array converts to 0
    expect(toNumber(null)).toBe(0); // null converts to 0
  });
});
