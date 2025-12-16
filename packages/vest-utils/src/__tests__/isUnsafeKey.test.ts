import { describe, it, expect } from 'vitest';
import isUnsafeKey from '../isUnsafeKey';

describe('isUnsafeKey', () => {
  it('should return true for __proto__', () => {
    expect(isUnsafeKey('__proto__')).toBe(true);
  });

  it('should return true for constructor', () => {
    expect(isUnsafeKey('constructor')).toBe(true);
  });

  it('should return true for prototype', () => {
    expect(isUnsafeKey('prototype')).toBe(true);
  });

  it('should return false for other keys', () => {
    expect(isUnsafeKey('someKey')).toBe(false);
    expect(isUnsafeKey('toString')).toBe(false);
    expect(isUnsafeKey('valueOf')).toBe(false);
  });
});
