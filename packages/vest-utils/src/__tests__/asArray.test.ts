import asArray from 'asArray';
import { describe, it, expect } from 'vitest';

describe('asArray', () => {
  it('should return an array', () => {
    expect(asArray('test')).toEqual(['test']);
    expect(asArray(['test'])).toEqual(['test']);
  });

  it('Should create a shallow copy of the array', () => {
    const arr = ['test'];
    expect(asArray(arr)).not.toBe(arr);
  });
});
