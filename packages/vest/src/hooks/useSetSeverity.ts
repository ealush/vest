import { invariant } from 'vest-utils';

import { useCurrentTest } from '../core/context/SuiteContext';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TestSeverity } from '../suiteResult/Severity';

export function useSetSeverity() {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ErrorStrings.SET_SEVERITY_MUST_BE_CALLED_FROM_TEST);

  return function setSeverity(severity: TestSeverity): void {
    VestTest.setSeverity(currentTest, severity);
  };
}
