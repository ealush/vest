import isPromise from 'isPromise';
import { describe, it, expect } from 'vitest';

describe('isPromise', () => {
  it('should return true for a Promise', () => {
    expect(isPromise(new Promise(() => {}))).toBe(true);
  });

  it('should return false for a non-Promise value', () => {
    expect(isPromise('not a Promise')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(isPromise(null)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
  });
});
