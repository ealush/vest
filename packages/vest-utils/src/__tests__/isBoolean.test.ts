import isBoolean from 'isBooleanValue';
import { describe, it, expect } from 'vitest';

describe('isBoolean', () => {
  it('Should pass for a boolean value', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(Boolean(1))).toBe(true);
  });

  it('Should fail for a non boolean value', () => {
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean([false])).toBe(false);
    expect(isBoolean(null)).toBe(false);
  });
});
