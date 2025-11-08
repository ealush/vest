import { either } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { VestTest } from 'VestTest';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: TIsolateTest,
): boolean {
  return either(severity === Severity.WARNINGS, VestTest.warns(testObject));
}
