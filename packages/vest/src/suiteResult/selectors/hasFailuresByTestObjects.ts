import { isEmpty } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { SuiteWalker } from 'SuiteWalker';
import { TestWalker } from 'TestWalker';
import { VestTest } from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';
import { nonMatchingSeverityProfile } from 'nonMatchingSeverityProfile';

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
  const allFailures = SuiteWalker.usePreAggs().failures;

  if (isEmpty(allFailures[severityKey])) {
    return false;
  }

  if (fieldName) {
    return !isEmpty(allFailures[severityKey][fieldName]);
  }

  return true;
}

export function hasGroupFailuresByTestObjects(
  severityKey: Severity,
  groupName: TGroupName,
  fieldName?: TFieldName,
): boolean {
  return TestWalker.someTests(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return false;
    }

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
