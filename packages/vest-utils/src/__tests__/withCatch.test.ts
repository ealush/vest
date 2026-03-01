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

  it('should pass arguments down to the callback', () => {
    const fn = withCatch((a: number, b: string) => `${a}-${b}`);
    expect(fn(1, 'b')).toBe('1-b');
  });

  it('should pass arguments to async deferred executions', async () => {
    const fn = withCatch((a: number) => a * 2);

    const result = await new Promise(resolve => {
      setTimeout(() => resolve(fn(5)), 10);
    });

    expect(result).toBe(10);
  });
});
