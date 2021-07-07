import createCache from 'cache';
import { isNull } from 'isNull';
import isPromise from 'isPromise';

import VestTest, { TTestFn } from 'VestTest';
import addTestToState from 'addTestToState';
import { isExcluded } from 'exclusive';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import { useSuiteId } from 'stateHooks';
import { testBase } from 'test';
/* eslint-disable jest/no-export */
export default function bindTestMemo(test: typeof testBase) {
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
    ...args: [fieldName: string, test: TTestFn, deps: unknown[]]
  ): VestTest;
  function memo(
    fieldName: string,
    ...args: [string, TTestFn, any[]] | [TTestFn, any[]]
  ): VestTest {
    const [suiteId] = useSuiteId();

    const [deps, testFn, msg] = args.reverse() as [any[], TTestFn, string];

    // Implicit dependency for more specificity
    const dependencies = [suiteId.id, fieldName].concat(deps);

    const cached = cache.get(dependencies);

    if (isNull(cached)) {
      // Cache miss. Start fresh
      return cache(dependencies, () => test(fieldName, msg, testFn));
    }

    const [, testObject] = cached;

    if (isExcluded(testObject)) {
      return testObject;
    }

    addTestToState(testObject);

    if (testObject && isPromise(testObject.asyncTest)) {
      setPending(testObject);
      runAsyncTest(testObject);
    }

    return testObject;
  }

  return memo;
}
