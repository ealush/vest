import createCache from 'cache';
import { isNull } from 'isNull';
import isPromise from 'isPromise';

import VestTest, { TTestFn } from 'VestTest';
import { isExcluded } from 'exclusive';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import { useSuiteId } from 'stateHooks';
import type { TTestBase } from 'test';
/* eslint-disable jest/no-export */
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
  function memo(
    fieldName: string,
    ...args:
      | [message: string, test: TTestFn, deps: unknown[]]
      | [test: TTestFn, deps: unknown[]]
  ): VestTest {
    const [suiteId] = useSuiteId();

    const [deps, testFn, msg] = args.reverse() as [any[], TTestFn, string];

    // Implicit dependency for more specificity
    const dependencies = [suiteId, fieldName].concat(deps);

    const cached = cache.get(dependencies);

    if (isNull(cached)) {
      // Cache miss. Start fresh
      return cache(dependencies, () => test(fieldName, msg, testFn));
    }

    const [, testObject] = cached;

    if (isExcluded(testObject)) {
      return testObject;
    }

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
