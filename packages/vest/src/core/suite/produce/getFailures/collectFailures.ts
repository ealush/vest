import { Severity } from 'Severity';
import { TestGroup } from 'genTestsSummary';

export function getByFieldName(
  testGroup: TestGroup,
  severityKey: Severity,
  fieldName: string
): string[] {
  return testGroup?.[fieldName]?.[severityKey] || [];
}

export function collectAll(
  testGroup: TestGroup,
  severityKey: Severity
): Record<string, string[]> {
  const output = {};

  for (const field in testGroup) {
    output[field] = testGroup[field]?.[severityKey] || [];
  }

  return output;
}
