import VestTest from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import nonMatchingSeverityProfile from 'nonMatchingSeverityProfile';
import type { TSeverity } from 'vestTypes';
/**
 * Determines whether a certain test profile has failures.
 */
export default function hasFailuresLogic(
  testObject: VestTest,
  severityKey: TSeverity,
  fieldName?: string
): boolean {
  if (!testObject.failed) {
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
