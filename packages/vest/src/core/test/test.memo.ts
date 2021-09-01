import createCache from 'cache';
import { isNull } from 'isNull';
import isPromise from 'isPromise';

import VestTest, { TTestFn } from 'VestTest';
import { isExcluded } from 'exclusive';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import {
  useSuiteId,
  useCursorAt,
  useTestAtCursor,
  useSetNextCursorAt,
  useSetTestAtCursor,
} from 'stateHooks';
import type { TTestBase } from 'test';

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

  /**
   * Caches, or returns an already cached test call
   */
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
    const [cursorAt] = useCursorAt();

    const [deps, testFn, msg] = args.reverse() as [any[], TTestFn, string];

    // Implicit dependency for more specificity
    const dependencies = [suiteId, fieldName, cursorAt].concat(deps);
    const cached = cache.get(dependencies);

    // Cache miss. Start fresh
    if (isNull(cached)) {
      return cache(dependencies, () => test(fieldName, msg, testFn));
    }

    const [, testObject] = cached;
    const prevRunTest = useTestAtCursor(testObject);

    if (isExcluded(testObject)) {
      useSetNextCursorAt();
      return prevRunTest;
    }

    useSetTestAtCursor(testObject);
    useSetNextCursorAt();
    handleAsyncTest(testObject);

    return testObject;
  }

  return memo;
}

function handleAsyncTest(testObject: VestTest): void {
  if (testObject && isPromise(testObject.asyncTest)) {
    setPending(testObject);
    runAsyncTest(testObject);
  }
}
