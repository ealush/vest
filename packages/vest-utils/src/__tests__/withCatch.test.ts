import { describe, it, expect } from 'vitest';
import { withCatch } from '../withCatch';

describe('withCatch', () => {
  it('should return the result of the callback if it succeeds', () => {
    const fn = withCatch(() => 'success');
    expect(fn()).toBe('success');
  });

  it('should return the error if the callback throws', () => {
    const error = new Error('failure');
    const fn = withCatch(() => {
      throw error;
    });
    expect(fn()).toBe(error);
  });
});
