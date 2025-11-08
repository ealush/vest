import { isArray } from 'isArrayValue';
import { describe, it, expect } from 'vitest';

describe('Tests isArray rule', () => {
  it('Should return true for an empty array', () => {
    expect(isArray([])).toBe(true);
  });

  it('Should return true for an array with elements', () => {
    expect(isArray([1, 2, 3])).toBe(true);
  });

  it('Should return false a string', () => {
    expect(isArray('1')).toBe(false);
  });
});
