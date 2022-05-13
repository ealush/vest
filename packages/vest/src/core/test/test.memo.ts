/* eslint-disable jest/valid-title */
import createCache from 'cache';
import { isNull } from 'isNull';

import VestTest, { TestFn } from 'VestTest';
import { useCursor } from 'isolate';
import registerPrevRunTest from 'registerPrevRunTest';
import { useSuiteId } from 'stateHooks';
import type { TestBase } from 'test';
// eslint-disable-next-line max-lines-per-function
export default function bindTestMemo(test: TestBase): {
  (fieldName: string, test: TestFn, deps: unknown[]): VestTest;
  (fieldName: string, message: string, test: TestFn, deps: unknown[]): VestTest;
} {
  const cache = createCache(10); // arbitrary cache size

  /**
   * Caches a test result based on the test's dependencies.
   */
  function memo(
    fieldName: string,
    ...args: [test: TestFn, deps: unknown[]]
  ): VestTest;
  function memo(
    fieldName: string,
    ...args: [message: string, test: TestFn, deps: unknown[]]
  ): VestTest;
  // eslint-disable-next-line max-statements
  function memo(
    fieldName: string,
    ...args:
      | [message: string, test: TestFn, deps: unknown[]]
      | [test: TestFn, deps: unknown[]]
  ): VestTest {
    const cursorAt = useCursor().current();

    const [deps, testFn, msg] = args.reverse() as [any[], TestFn, string];

    // Implicit dependency for more specificity
    const dependencies = [useSuiteId(), fieldName, cursorAt].concat(deps);

    const cached = cache.get(dependencies);

    if (isNull(cached)) {
      // cache miss
      return cache(dependencies, () => test(fieldName, msg, testFn));
    }

    if (cached[1].isCanceled()) {
      // cache hit, but test is canceled
      cache.invalidate(dependencies);
      return cache(dependencies, () => test(fieldName, msg, testFn));
    }

    return registerPrevRunTest(cached[1]);
  }

  return memo;
}
