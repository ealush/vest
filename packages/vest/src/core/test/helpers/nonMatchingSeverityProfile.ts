import { either } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: IsolateTest
): boolean {
  return either(severity === Severity.WARNINGS, testObject.warns());
}
