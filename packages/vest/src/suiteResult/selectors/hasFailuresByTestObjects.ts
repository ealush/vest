import { VestRuntime } from 'vestjs-runtime';

import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { isVestIsolate } from '../../core/isolate/VestIsolateType';
import { nonMatchingFieldName } from '../../core/test/helpers/matchingFieldName';
import { nonMatchingSeverityProfile } from '../../core/test/helpers/nonMatchingSeverityProfile';
import { Severity } from '../Severity';
import { TFieldName } from '../SuiteResultTypes';

/**
 * The difference between this file and hasFailures is that hasFailures uses the static
 * summary object, while this one uses the actual validation state
 */

export function hasErrorsByTestObjects(fieldName?: TFieldName): boolean {
  return hasFailuresByTestObjects(Severity.ERRORS, fieldName);
}

function hasFailuresByTestObjects(
  severityKey: Severity,
  fieldName?: TFieldName,
): boolean {
  const root = VestRuntime.useAvailableRoot();

  if (!isVestIsolate(root)) {
    return false;
  }

  const tests = root.data.tests;

  return tests.some(testObject => {
    return hasFailuresByTestObject(testObject, severityKey, fieldName);
  });
}

/**
 * Determines whether a certain test profile has failures.
 */
export function hasFailuresByTestObject(
  testObject: TIsolateTest,
  severityKey: Severity,
  fieldName?: TFieldName,
): boolean {
  if (!VestTest.hasFailures(testObject)) {
    return false;
  }

  if (nonMatchingFieldName(VestTest.getData(testObject), fieldName)) {
    return false;
  }

  if (nonMatchingSeverityProfile(severityKey, testObject)) {
    return false;
  }

  return true;
}
