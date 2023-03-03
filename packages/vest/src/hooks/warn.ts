import { invariant } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { useCurrentTest } from 'SuiteContext';

const ERROR_OUTSIDE_OF_TEST = __DEV__
  ? "warn hook called outside of a test callback. It won't have an effect."
  : 'warn called outside of a test.';

/**
 * Sets a running test to warn only mode.
 */
// @vx-allow use-use
export function warn(): void {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ERROR_OUTSIDE_OF_TEST);

  currentTest.warn();
}
