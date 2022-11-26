/* eslint-disable jest/valid-title */
import VestTest, { TestFn } from 'VestTest';
import type { TestBase } from 'test';
import { cache as createCache, isNull } from 'vest-utils';

import { useCursor } from 'isolateHooks';
import registerPrevRunTest from 'registerPrevRunTest';
import { useSuiteId } from 'stateHooks';

export default function testMemo(test: TestBase): TestMemo {
  const cache = createCache<VestTest>(10); // arbitrary cache size

  /**
   * Caches a test result based on the test's dependencies.
   */
  function memo(fieldName: string, ...args: ParametersWithoutMessage): VestTest;
  function memo(fieldName: string, ...args: ParametersWithMessage): VestTest;
  function memo(fieldName: string, ...args: ParamsOverload): VestTest {
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
