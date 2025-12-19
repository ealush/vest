import { expect, it } from 'vitest';
import { create as suite, test } from '../../../../vest';
import { VestRuntime } from 'vestjs-runtime';

it('Should automatically track IsolateTest instances in the "VEST_TESTS" watcher', () => {
  let testsLength = 0;
  let t1Name;
  let t2Name;

  const s = suite(() => {
    test('f1', () => {});
    test('f2', () => {});

    const testsIterable = VestRuntime.useWatchedIsolates('VEST_TESTS');
    // Convert Iterable to Array to access length and indexes
    const tests = Array.from(testsIterable);
    testsLength = tests.length;
    if (tests.length > 0) t1Name = (tests[0] as any).data.fieldName;
    if (tests.length > 1) t2Name = (tests[1] as any).data.fieldName;
  });

  s.run();

  expect(testsLength).toBe(2);
  expect(t1Name).toBe('f1');
  expect(t2Name).toBe('f2');
});
