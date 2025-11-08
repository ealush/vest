import either from 'either';
import { describe, it, expect } from 'vitest';

describe('either', () => {
  it('returns true if one argument is truthy and the other is falsy', () => {
    expect(either(true, false)).toBe(true);
    expect(either(1, 0)).toBe(true);
    expect(either('hello', '')).toBe(true);
  });

  it('returns false if both arguments are truthy or falsy', () => {
    expect(either(true, true)).toBe(false);
    expect(either(false, false)).toBe(false);
    expect(either(1, 2)).toBe(false);
    expect(either('', null)).toBe(false);
  });
});
