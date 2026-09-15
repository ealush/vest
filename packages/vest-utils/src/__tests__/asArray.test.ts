import asArray from '../asArray';
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

describe('asArray readonly inputs', () => {
  it('accepts readonly arrays and returns a mutable copy', () => {
    const input: readonly string[] = ['a', 'b'];
    const output = asArray(input);
    expect(output).toEqual(['a', 'b']);
    expect(output).not.toBe(input);
    output.push('c');
    expect(input).toEqual(['a', 'b']);
  });
});
