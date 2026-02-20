import { describe, expect, it } from 'vitest';
import { isEmptySet, isNotEmptySet } from '../isEmptySet';

describe('isEmptySet', () => {
  it('Should return true for an empty Set', () => {
    expect(isEmptySet(new Set())).toBe(true);
  });

  it('Should return false for a non-empty Set', () => {
    expect(isEmptySet(new Set([1]))).toBe(false);
  });
});

describe('isNotEmptySet', () => {
  it('Should return false for an empty Set', () => {
    expect(isNotEmptySet(new Set())).toBe(false);
  });

  it('Should return true for a non-empty Set', () => {
    expect(isNotEmptySet(new Set([1]))).toBe(true);
  });
});
