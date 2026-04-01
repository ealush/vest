import { bench, describe } from 'vitest';

import { enforce } from '../src/vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      benchAsyncImmediate: (value: number) => Promise<{ pass: boolean }>;
      benchAsyncDelayed: (value: string) => Promise<{ pass: boolean }>;
      benchAsyncWithMessage: (
        value: number,
      ) => Promise<{ pass: boolean; message: () => string }>;
    }
  }
}

enforce.extend({
  benchAsyncImmediate: async (value: number) => ({
    pass: value > 0,
  }),
  benchAsyncDelayed: async (value: string) => {
    await new Promise(resolve => setTimeout(resolve, 0));
    return { pass: value.length > 0 };
  },
  benchAsyncWithMessage: async (value: number) => ({
    pass: value > 0,
    message: () => `${value} must be positive`,
  }),
});

describe('Async Enforce - Single Rule', () => {
  bench('async rule (immediate resolve, pass)', async () => {
    await enforce(5).benchAsyncImmediate();
  });

  bench('async rule (immediate resolve, fail)', async () => {
    try {
      await enforce(-1).benchAsyncImmediate();
    } catch {
      // expected
    }
  });

  bench('async rule (delayed resolve, pass)', async () => {
    await enforce('hello').benchAsyncDelayed();
  });
});

describe('Async Enforce - Chain Patterns', () => {
  bench('sync then async', async () => {
    await enforce(5).isNumber().benchAsyncImmediate();
  });

  bench('async then sync', async () => {
    await enforce(5).benchAsyncImmediate().greaterThan(0);
  });

  bench('multiple sync then async', async () => {
    await enforce(5)
      .isNumber()
      .greaterThan(0)
      .lessThan(100)
      .benchAsyncImmediate();
  });

  bench('async then multiple sync', async () => {
    await enforce(5)
      .benchAsyncImmediate()
      .isNumber()
      .greaterThan(0)
      .lessThan(100);
  });

  bench('two async rules', async () => {
    await enforce(5).benchAsyncImmediate().benchAsyncWithMessage();
  });

  bench('sync-async-sync-async', async () => {
    await enforce(5)
      .isNumber()
      .benchAsyncImmediate()
      .greaterThan(0)
      .benchAsyncWithMessage();
  });
});

describe('Async Enforce - Sync Baseline Comparison', () => {
  bench('sync-only chain (no async overhead)', () => {
    enforce(5).isNumber().greaterThan(0).lessThan(100);
  });

  bench('sync-only long chain', () => {
    enforce(10).isNumber().greaterThan(0).lessThan(100).equals(10);
  });
});

describe('Async Enforce - Message Handling', () => {
  bench('async rule with message function (pass)', async () => {
    await enforce(5).benchAsyncWithMessage();
  });

  bench('async rule with message function (fail)', async () => {
    try {
      await enforce(-1).benchAsyncWithMessage();
    } catch {
      // expected
    }
  });

  bench('.message() override with async rule (fail)', async () => {
    try {
      await enforce(-1).message('custom error').benchAsyncImmediate();
    } catch {
      // expected
    }
  });
});

describe('Async Enforce - Throughput', () => {
  bench('10 sequential async enforce calls', async () => {
    for (let i = 0; i < 10; i++) {
      await enforce(i + 1).benchAsyncImmediate();
    }
  });

  bench('10 concurrent async enforce calls', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        enforce(i + 1).benchAsyncImmediate(),
      ),
    );
  });

  bench('10 sequential sync enforce calls (baseline)', () => {
    for (let i = 0; i < 10; i++) {
      enforce(i + 1)
        .isNumber()
        .greaterThan(0);
    }
  });
});
