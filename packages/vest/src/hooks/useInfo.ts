import { invariant } from 'vest-utils';

import { useCurrentTest } from '../core/context/SuiteContext';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TestSeverity } from '../suiteResult/Severity';

export function useInfo() {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ErrorStrings.USE_INFO_MUST_BE_CALLED_FROM_TEST);

  return function setInfo(): void {
    VestTest.setSeverity(currentTest, TestSeverity.Info);
  };
}
