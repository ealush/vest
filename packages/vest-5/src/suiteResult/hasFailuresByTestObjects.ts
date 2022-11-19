import { Severity } from 'Severity';
import { SuiteWalker } from 'SuiteWalker';
import { VestTest } from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';
import { nonMatchingSeverityProfile } from 'nonMatchingSeverityProfile';

import { Isolate, IsolateTypes } from 'isolateTypes';

/**
 * The difference between this file and hasFailures is that hasFailures uses the static
 * summary object, while this one uses the actual validation state
 */

export function hasErrorsByTestObjects(fieldName?: string): boolean {
  return hasFailuresByTestObjects(Severity.ERRORS, fieldName);
}

export function hasFailuresByTestObjects(
  severityKey: Severity,
  fieldName?: string
): boolean {
  return SuiteWalker.some((node: Isolate) => {
    return hasFailuresByTestObject(
      node.data as VestTest,
      severityKey,
      fieldName
    );
  }, IsolateTypes.TEST);
}

export function hasGroupFailuresByTestObjects(
  severityKey: Severity,
  groupName: string,
  fieldName?: string
): boolean {
  return SuiteWalker.some((node: Isolate) => {
    const testObject = node.data as VestTest;
    if (nonMatchingGroupName(testObject, groupName)) {
      return false;
    }

    return hasFailuresByTestObject(testObject, severityKey, fieldName);
  }, IsolateTypes.TEST);
}

/**
 * Determines whether a certain test profile has failures.
 */
export function hasFailuresByTestObject(
  testObject: VestTest,
  severityKey: Severity,
  fieldName?: string
): boolean {
  if (!testObject.hasFailures()) {
    return false;
  }

  if (nonMatchingFieldName(testObject, fieldName)) {
    return false;
  }

  if (nonMatchingSeverityProfile(severityKey, testObject)) {
    return false;
  }

  return true;
}
