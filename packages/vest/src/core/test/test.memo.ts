import createCache from 'cache';
import { isNull } from 'isNull';

import VestTest, { TTestFn } from 'VestTest';
import registerPrevRunTest from 'registerPrevRunTest';
import { useSuiteId } from 'stateHooks';
import type { TTestBase } from 'test';
import * as testCursor from 'testCursor';
// eslint-disable-next-line max-lines-per-function
export default function bindTestMemo(test: TTestBase): {
  (fieldName: string, test: TTestFn, deps: unknown[]): VestTest;
  (
    fieldName: string,
    message: string,
    test: TTestFn,
    deps: unknown[]
  ): VestTest;
} {
  const cache = createCache(100); // arbitrary cache size

  // Caches, or returns an already cached test call
  function memo(
    fieldName: string,
    ...args: [test: TTestFn, deps: unknown[]]
  ): VestTest;
  function memo(
    fieldName: string,
    ...args: [message: string, test: TTestFn, deps: unknown[]]
  ): VestTest;
  // eslint-disable-next-line max-statements
  function memo(
    fieldName: string,
    ...args:
      | [message: string, test: TTestFn, deps: unknown[]]
      | [test: TTestFn, deps: unknown[]]
  ): VestTest {
    const [suiteId] = useSuiteId();
    const cursorAt = testCursor.useCursorAt();

    const [deps, testFn, msg] = args.reverse() as [any[], TTestFn, string];

    // Implicit dependency for more specificity
    const dependencies = [suiteId, fieldName, cursorAt].concat(deps);

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
