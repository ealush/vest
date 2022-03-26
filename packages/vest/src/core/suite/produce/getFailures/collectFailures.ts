import { Severity } from 'Severity';
import { TestGroup } from 'genTestsSummary';

// calls collectAll or getByFieldName depending on whether fieldName is provided

export function gatherFailures(
  testGroup: TestGroup,
  severityKey: Severity,
  fieldName?: string
): string[] | Record<string, string[]> {
  return fieldName
    ? getByFieldName(testGroup, severityKey, fieldName)
    : collectAll(testGroup, severityKey);
}

function getByFieldName(
  testGroup: TestGroup,
  severityKey: Severity,
  fieldName: string
): string[] {
  return testGroup?.[fieldName]?.[severityKey] || [];
}

function collectAll(
  testGroup: TestGroup,
  severityKey: Severity
): Record<string, string[]> {
  const output = {};

  for (const field in testGroup) {
    output[field] = testGroup[field]?.[severityKey] || [];
  }

  return output;
}
