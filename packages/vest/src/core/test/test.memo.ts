import { isNull } from 'vest-utils';

import { useCurrentCursor, useSuiteId } from 'PersistedContext';
import { useTestMemoCache } from 'SuiteContext';
import { TestFn } from 'TestTypes';
import { VestTest } from 'VestTest';
import { VTest } from 'test';
import { testObjectIsolate } from 'testObjectIsolate';

export function wrapTestMemo(test: VTest): TestMemo {
  /**
   * Caches a test result based on the test's dependencies.
   */
  function memo(fieldName: string, ...args: ParametersWithoutMessage): VestTest;
  function memo(fieldName: string, ...args: ParametersWithMessage): VestTest;
  function memo(fieldName: string, ...args: ParamsOverload): VestTest {
    const [deps, testFn, msg] = args.reverse() as [any[], TestFn, string];

    // Implicit dependency for better specificity
    const dependencies = [useSuiteId(), fieldName, useCurrentCursor()].concat(
      deps
    );

    return getTestFromCache(dependencies, cacheAction);

    function cacheAction() {
      return test(fieldName, msg, testFn);
    }
  }

  return memo;
}

function getTestFromCache(
  dependencies: any[],
  cacheAction: () => VestTest
): VestTest {
  const cache = useTestMemoCache();

  const cached = cache.get(dependencies);

  if (isNull(cached)) {
    // cache miss
    return cache(dependencies, cacheAction);
  }

  if (cached[1].isCanceled()) {
    // cache hit, but test is canceled
    cache.invalidate(dependencies);
    return cache(dependencies, cacheAction);
  }

  return testObjectIsolate(cached[1]);
}

type TestMemo = {
  (fieldName: string, ...args: ParametersWithoutMessage): VestTest;
  (fieldName: string, ...args: ParametersWithMessage): VestTest;
};

type ParametersWithoutMessage = [test: TestFn, dependencies: unknown[]];
type ParametersWithMessage = [
  message: string,
  test: TestFn,
  dependencies: unknown[]
];

type ParamsOverload = ParametersWithoutMessage | ParametersWithMessage;
