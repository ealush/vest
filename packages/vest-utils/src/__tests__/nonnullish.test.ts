import { nonnullish } from 'nonnullish';
import { describe, it, expect } from 'vitest';

describe('nonnullish', () => {
  it('should return the value if it is not null or undefined', () => {
    const value = 'hello';
    expect(nonnullish(value)).toBe(value);
  });

  it('should throw an error if the value is null', () => {
    const value = null;
    expect(() => nonnullish(value)).toThrow();
  });

  it('should throw an error if the value is undefined', () => {
    const value = undefined;
    expect(() => nonnullish(value)).toThrow();
  });

  it('should throw a custom error message if provided', () => {
    const value = null;
    const errorMessage = 'Value must be defined';
    expect(() => nonnullish(value, errorMessage)).toThrow(errorMessage);
  });
});
