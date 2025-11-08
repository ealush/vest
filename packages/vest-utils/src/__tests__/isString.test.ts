import isStringValue from 'isStringValue';
import { describe, it, expect } from 'vitest';

describe('Tests isString rule', () => {
  it('Should return false for non-string values', () => {
    expect(isStringValue(42)).toBe(false);
    expect(isStringValue([])).toBe(false);
  });

  it('Should return true for string values', () => {
    expect(isStringValue('I love you')).toBe(true);
  });
});
