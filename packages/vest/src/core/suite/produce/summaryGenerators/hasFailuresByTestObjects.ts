import { Severity } from 'Severity';
import VestTest from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';
import nonMatchingSeverityProfile from 'nonMatchingSeverityProfile';
import { useTestsFlat } from 'stateHooks';

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
  const testObjects = useTestsFlat();
  return testObjects.some(testObject =>
    hasFailuresByTestObject(testObject, severityKey, fieldName)
  );
}

export function hasGroupFailuresByTestObjects(
  severityKey: Severity,
  groupName: string,
  fieldName?: string
): boolean {
  const testObjects = useTestsFlat();
  return testObjects.some(testObject => {
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
