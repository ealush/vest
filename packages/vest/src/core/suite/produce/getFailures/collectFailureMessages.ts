import { Severity } from 'Severity';
import VestTest from 'VestTest';
import { nonMatchingFieldName } from 'matchingFieldName';
import nonMatchingSeverityProfile from 'nonMatchingSeverityProfile';

export default function collectFailureMessages(
  severity: Severity,
  testObjects: VestTest[],
  options: { group?: string; fieldName?: string } = {}
): Record<string, string[]> {
  const { group, fieldName } = options || {};
  return testObjects.reduce(
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
}

function noGroupMatch(
  testObject: VestTest,
  groupName?: void | string
): boolean {
  return !!(groupName && testObject.groupName !== groupName);
}

function noMatch(
  testObject: VestTest,
  severity: Severity,
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
