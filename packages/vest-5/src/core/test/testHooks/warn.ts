import { invariant } from 'vest-utils';

import { useCurrentTest } from 'SuiteContext';

const ERROR_OUTSIDE_OF_TEST = __DEV__
  ? "warn hook called outside of a test callback. It won't have an effect."
  : 'warn called outside of a test.';

/**
 * Sets a running test to warn only mode.
 */
export function warn(): void {
  const currentTest = useCurrentTest();

  invariant(currentTest, ERROR_OUTSIDE_OF_TEST);

  currentTest.warn();
}
