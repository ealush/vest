import { isPositive } from 'vest-utils';

import { countKeyBySeverity, Severity } from 'Severity';
import { TestsContainer } from 'genTestsSummary';

// calls collectAll or getByFieldName depending on whether fieldName is provided

export function gatherFailures(
  testGroup: TestsContainer,
  severityKey: Severity,
  fieldName?: string
): string[] | FailureMessages {
  return fieldName
    ? getByFieldName(testGroup, severityKey, fieldName)
    : collectAll(testGroup, severityKey);
}

function getByFieldName(
  testGroup: TestsContainer,
  severityKey: Severity,
  fieldName: string
): string[] {
  return testGroup?.[fieldName]?.[severityKey] || [];
}

function collectAll(
  testGroup: TestsContainer,
  severityKey: Severity
): FailureMessages {
  const output: FailureMessages = {};

  const countKey = countKeyBySeverity(severityKey);

  for (const field in testGroup) {
    if (isPositive(testGroup[field][countKey])) {
      // We will probably never get to the fallback array
      // leaving it just in case the implementation changes
      output[field] = testGroup[field][severityKey] || [];
    }
  }

  return output;
}

export type FailureMessages = Record<string, string[]>;
