import { Severity } from 'Severity';
import { VestTest } from 'VestTest';
import { either } from 'vest-utils';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: VestTest
): boolean {
  return either(severity === Severity.WARNINGS, testObject.warns());
}
