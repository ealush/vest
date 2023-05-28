import { ErrorStrings } from 'ErrorStrings';
import { invariant } from 'vest-utils';

import { useCurrentTest } from 'SuiteContext';

const ERROR_OUTSIDE_OF_TEST = ErrorStrings.WARN_MUST_BE_CALLED_FROM_TEST;

/**
 * Sets the severity level of a test to `warn`, allowing it to fail without marking the suite as invalid.
 * Use this function within the body of a test to create warn-only tests.
 *
 * @returns {void}
 *
 * @example
 *   test('password', 'Your password strength is: WEAK', () => {
 *     warn();
 *
 *     enforce(data.password).matches(/0-9/);
 *   });
 *
 * @limitations
 * - The `warn` function should only be used within the body of a `test` function.
 * - When using `warn()` in an async test, it should be called in the synchronous portion of the test, not after an `await` call or in the Promise body.
 * - It is recommended to call `warn()` at the top of the test function.
 */
// @vx-allow use-use
export function warn(): void {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ERROR_OUTSIDE_OF_TEST);

  currentTest.warn();
}
