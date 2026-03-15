import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

describe('enforce.extend with async rules', () => {
  it('should register and execute an async custom rule properly', async () => {
    enforce.extend({
      myCustomAsyncRule: async (val: number) => {
        return { pass: val > 5 };
      },
    });

    // @ts-expect-error - testing dynamic rule
    await expect(enforce(10).myCustomAsyncRule()).resolves.toBeUndefined();
    // @ts-expect-error - testing dynamic rule
    await expect(enforce(2).myCustomAsyncRule()).rejects.toThrow();
  });
});
