import { either } from 'vest-utils';

import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { Severity } from '../../../suiteResult/Severity';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: TIsolateTest,
): boolean {
  return either(severity === Severity.WARNINGS, VestTest.warns(testObject));
}
