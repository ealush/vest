import { either } from 'vest-utils';

import { Severity } from 'Severity';
import VestTest from 'VestTest';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export default function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: VestTest
): boolean {
  return either(severity === Severity.WARNINGS, testObject.warns());
}
