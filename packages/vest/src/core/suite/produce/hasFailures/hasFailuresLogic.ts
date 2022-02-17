import { Severity } from 'Severity';
import VestTest from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import nonMatchingSeverityProfile from 'nonMatchingSeverityProfile';
/**
 * Determines whether a certain test profile has failures.
 */
export default function hasFailuresLogic(
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
