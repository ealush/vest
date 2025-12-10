import { describe, it, expect, afterEach } from 'vitest';
import { withResolvers } from '../withResolvers';

describe('withResolvers', () => {
  const originalWithResolvers = Promise.withResolvers;

  afterEach(() => {
    // Restore the original implementation
    if (originalWithResolvers) {
      Promise.withResolvers = originalWithResolvers;
    } else {
      // @ts-ignore
      delete Promise.withResolvers;
    }
  });

  it('should return a promise, resolve, and reject', () => {
    const { promise, resolve, reject } = withResolvers();
    expect(promise).toBeInstanceOf(Promise);
    expect(typeof resolve).toBe('function');
    expect(typeof reject).toBe('function');
  });

  it('should resolve the promise', async () => {
    const { promise, resolve } = withResolvers<string>();
    resolve('success');
    await expect(promise).resolves.toBe('success');
  });

  it('should reject the promise', async () => {
    const { promise, reject } = withResolvers<string>();
    const error = new Error('fail');
    reject(error);
    await expect(promise).rejects.toBe(error);
  });

  it('should use the polyfill if Promise.withResolvers is not defined', async () => {
    // @ts-ignore
    Promise.withResolvers = undefined;

    const { promise, resolve } = withResolvers<string>();
    resolve('polyfill');
    await expect(promise).resolves.toBe('polyfill');
  });
});
