import { invariant } from 'vest-utils';

import { useCurrentTest } from '../core/context/SuiteContext';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TestSeverity } from '../suiteResult/Severity';

export function useSeverity() {
  const currentTest = useCurrentTest(ErrorStrings.HOOK_CALLED_OUTSIDE);

  invariant(currentTest, ErrorStrings.USE_SEVERITY_MUST_BE_CALLED_FROM_TEST);

  return {
    info(): void {
      VestTest.setSeverity(currentTest, TestSeverity.Info);
    },
    success(): void {
      VestTest.setSeverity(currentTest, TestSeverity.Success);
    },
    warn(): void {
      VestTest.setSeverity(currentTest, TestSeverity.Warning);
    },
  };
}
