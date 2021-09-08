import either from 'either';

import VestTest from 'VestTest';
import type { TSeverity } from 'vestTypes';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export default function nonMatchingSeverityProfile(
  severity: TSeverity,
  testObject: VestTest
): boolean {
  return either(severity === 'warnings', testObject.warns);
}
