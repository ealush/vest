import { either } from 'vest-utils';

import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '@/core/isolate/IsolateTest/VestTest';
import { Severity } from '@/suiteResult/Severity';

/**
 * Checks that a given test object matches the currently specified severity level
 */
export function nonMatchingSeverityProfile(
  severity: Severity,
  testObject: TIsolateTest,
): boolean {
  return either(severity === Severity.WARNINGS, VestTest.warns(testObject));
}
