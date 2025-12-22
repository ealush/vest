import { bench, describe } from 'vitest';
import { create, test, enforce, group, skip } from '../../src/vest';
import { TFieldName, TGroupName } from '../../src/suiteResult/SuiteResultTypes';

// --- Complex Combinations ---

const suiteAsyncGroupSkip = create(() => {
  group('g1' as TGroupName, () => {
    skip(true);
    test('t1', async () => {});
  });
});

const suiteDeepAsync = create(() => {
  group('l1' as TGroupName, () => {
    group('l2' as TGroupName, () => {
      group('l3' as TGroupName, () => {
        test('async_deep', async () => {});
      });
    });
  });
});

const suiteLargePayload = create(() => {
  test('large', () => {
    enforce(false).message('a'.repeat(5000)).equals(true);
  });
});

const suiteHighFreqTest = create(() => {
  for (let i = 0; i < 100; i++) {
    test('noop' as TFieldName, () => {});
  }
});

describe('Complex Combinations & Edge Cases', () => {
  bench('Async Group + Skip', () => {
    suiteAsyncGroupSkip.run();
  });
  bench('Deeply Nested Async', () => {
    suiteDeepAsync.run();
  });
  bench('Dynamic Suite Creation', () => {
    const s = create(() => {});
    s.run();
  });
  bench('Large Payload Messages', () => {
    suiteLargePayload.run();
  });
  bench('High Frequency test Creation', () => {
    suiteHighFreqTest.run();
  });
});
