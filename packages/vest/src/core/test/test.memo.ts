import { isNull } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { useCurrentCursor, useSuiteId } from 'PersistedContext';
import { useTestMemoCache } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { VTest } from 'test';

// @vx-allow use-use
export function wrapTestMemo<FN extends TFieldName>(test: VTest): TestMemo<FN> {
  /**
   * Caches a test result based on the test's dependencies.
   */
  function memo<F extends FN>(
    fieldName: F,
    ...args: ParametersWithoutMessage
  ): IsolateTest;
  function memo<F extends FN>(
    fieldName: F,
    ...args: ParametersWithMessage
  ): IsolateTest;
  function memo<F extends FN>(
    fieldName: F,
    ...args: ParamsOverload
  ): IsolateTest {
    const [deps, testFn, msg] = args.reverse() as [any[], TestFn, string];

    // Implicit dependency for better specificity
    const dependencies = [useSuiteId(), fieldName, useCurrentCursor()].concat(
      deps
    );

    return useGetTestFromCache(dependencies, cacheAction);

    function cacheAction() {
      return test(fieldName, msg, testFn);
    }
  }

  return memo;
}

function useGetTestFromCache(
  dependencies: any[],
  cacheAction: () => IsolateTest
): IsolateTest {
  const cache = useTestMemoCache();

  const cached = cache.get(dependencies);

  if (isNull(cached)) {
    // cache miss
    return cache(dependencies, cacheAction);
  }

  const [, cachedValue] = cached;

  if (cachedValue.isCanceled()) {
    // cache hit, but test is canceled
    cache.invalidate(dependencies);
    return cache(dependencies, cacheAction);
  }

  IsolateTest.setNode(cachedValue);

  return cachedValue;
}

export type TestMemo<F extends TFieldName> = {
  (fieldName: F, ...args: ParametersWithoutMessage): IsolateTest;
  (fieldName: F, ...args: ParametersWithMessage): IsolateTest;
};

type ParametersWithoutMessage = [test: TestFn, dependencies: unknown[]];
type ParametersWithMessage = [
  message: string,
  test: TestFn,
  dependencies: unknown[]
];

type ParamsOverload = ParametersWithoutMessage | ParametersWithMessage;
