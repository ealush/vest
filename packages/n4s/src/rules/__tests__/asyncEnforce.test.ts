import { beforeAll, describe, expect, it } from 'vitest';

import { enforce } from '../../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      isAvailableAsync: (
        value: string,
      ) => Promise<{ pass: boolean; message: () => string }>;
    }
  }
}

describe('Asynchronous Enforcements', () => {
  beforeAll(() => {
    enforce.extend({
      isAvailableAsync: async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 10));

        return { pass: value === 'available', message: () => 'Not available' };
      },
    });
  });

  it('should pass async rules when valid', async () => {
    await expect(
      enforce('available').isString().isAvailableAsync(),
    ).resolves.toBeUndefined();
  });

  it('should reject when async rule fails', async () => {
    await expect(
      enforce('taken').isString().isAvailableAsync(),
    ).rejects.toThrow('Not available');
  });

  it('FAIL FAST: should throw immediately if sync rule fails before async rule', () => {
    expect(() => {
      enforce(123).isString().isAvailableAsync();
    }).toThrow();
  });

  it('should queue sync rules AFTER async rules', async () => {
    await expect(
      enforce('available').isAvailableAsync().equals('taken'),
    ).rejects.toThrow();
  });
});
