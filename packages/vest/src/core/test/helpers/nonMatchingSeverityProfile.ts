import { makeResult, Result } from 'vest-utils';

import { Severity } from '../../../suiteResult/Severity';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: TIsolateTest,
): Result<boolean> {
  const isWarning = VestTest.warns(testObject).unwrap();
  const isSuccess = VestTest.isSuccess(testObject).unwrap();

  const matchingSeverityProfile: Record<Severity, boolean> = {
    [Severity.ERRORS]: !(isWarning || isSuccess),
    [Severity.SUCCESSES]: isSuccess,
    [Severity.WARNINGS]: isWarning,
  };

  return makeResult.Ok(!matchingSeverityProfile[severity]);
}
