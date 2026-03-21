import { invariant } from 'vest-utils';

import { useCurrentTest } from '../core/context/SuiteContext';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TestSeverity } from '../suiteResult/Severity';

export function useSuccess() {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ErrorStrings.USE_SUCCESS_MUST_BE_CALLED_FROM_TEST);

  return function setSuccess(): void {
    VestTest.setSeverity(currentTest, TestSeverity.Success);
  };
}
