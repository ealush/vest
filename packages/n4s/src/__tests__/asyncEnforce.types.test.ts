import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      isAsyncPass: (value: string) => Promise<{ pass: boolean }>;
    }
  }
}

function syncTypeChecks() {
  // @ts-expect-error - sync-only chains should not expose promise methods at type level
  enforce('sync')
    .isString()
    .then(() => undefined);
}

describe('Async Enforce Types', () => {
  void syncTypeChecks;

  it('should allow awaiting the enforce chain after async rule is invoked', async () => {
    enforce.extend({
      isAsyncPass: async (value: string) => ({ pass: value.length > 0 }),
    });

    const result: void = await enforce('test').isString().isAsyncPass();
    expect(result).toBeUndefined();
  });
});
