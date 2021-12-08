import VestTest from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import nonMatchingSeverityProfile from 'nonMatchingSeverityProfile';
import type { TSeverity } from 'vestTypes';

export default function collectFailureMessages(
  severity: TSeverity,
  testObjects: VestTest[],
  options: { group?: string; fieldName?: string } = {}
): Record<string, string[]> {
  const { group, fieldName } = options || {};
  const res = testObjects.reduce(
    (collector: Record<string, string[]>, testObject) => {
      if (noMatch(testObject, severity, group, fieldName)) {
        return collector;
      }

      if (!testObject.hasFailures()) {
        return collector;
      }

      collector[testObject.fieldName] = (
        collector[testObject.fieldName] || []
      ).concat(testObject.message || []);

      return collector;
    },
    { ...(fieldName && { [fieldName]: [] }) }
  );

  return res;
}

function noGroupMatch(
  testObject: VestTest,
  groupName?: void | string
): boolean {
  return !!(groupName && testObject.groupName !== groupName);
}

function noMatch(
  testObject: VestTest,
  severity: TSeverity,
  group: void | string,
  fieldName: void | string
): boolean {
  if (noGroupMatch(testObject, group)) {
    return true;
  }

  if (nonMatchingFieldName(testObject, fieldName)) {
    return true;
  }

  if (nonMatchingSeverityProfile(severity, testObject)) {
    return true;
  }

  return false;
}
