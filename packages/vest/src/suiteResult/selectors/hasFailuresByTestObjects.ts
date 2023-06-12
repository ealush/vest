import { IsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import { VestTestInspector } from 'VestTestInspector';
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
  fieldName?: TFieldName
): boolean {
  return TestWalker.someTests(testObject => {
    return hasFailuresByTestObject(testObject, severityKey, fieldName);
  });
}

export function hasGroupFailuresByTestObjects(
  severityKey: Severity,
  groupName: TGroupName,
  fieldName?: TFieldName
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
  testObject: IsolateTest,
  severityKey: Severity,
  fieldName?: TFieldName
): boolean {
  if (!VestTestInspector.hasFailures(testObject)) {
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
