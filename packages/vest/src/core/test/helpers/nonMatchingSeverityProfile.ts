import { either, makeResult, Result } from 'vest-utils';

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
  return makeResult.Ok(
    either(severity === Severity.WARNINGS, VestTest.warns(testObject).unwrap()),
  );
}
