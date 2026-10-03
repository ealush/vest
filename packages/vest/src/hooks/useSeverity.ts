import { invariant } from 'vest-utils';

import { useCurrentTest } from '../core/context/SuiteContext';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TestSeverity } from '../suiteResult/Severity';

export function useSeverity() {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ErrorStrings.USE_WARN_MUST_BE_CALLED_FROM_TEST);

  return function setSeverity(severity: TestSeverity): void {
    VestTest.setSeverity(currentTest, severity);
  };
}

export function useWarn() {
  const setSeverity = useSeverity();

  return function setWarn(): void {
    setSeverity(TestSeverity.Warning);
  };
}

export function useSuccess() {
  const setSeverity = useSeverity();

  return function setSuccess(): void {
    setSeverity(TestSeverity.Success);
  };
}

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
 * - When using `warn()` in an async test, it should be called in the synchronous portion of the test, not after an `await` call or in the Promise body (see `useWarn`).
 * - It is recommended to call `warn()` at the top of the test function.
 */
// eslint-disable-next-line vest-internal/use-use
export function warn(): void {
  const setWarn = useWarn();
  setWarn();
}

// eslint-disable-next-line vest-internal/use-use
export function success(): void {
  const setSuccess = useSuccess();
  setSuccess();
}
