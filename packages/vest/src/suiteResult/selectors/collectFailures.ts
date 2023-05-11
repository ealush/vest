import { isPositive } from 'vest-utils';

import { countKeyBySeverity, Severity } from 'Severity';
import {
  FailureMessages,
  GetFailuresResponse,
  TestsContainer,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { SummaryFailure } from 'SummaryFailure';

// calls collectAll or getByFieldName depending on whether fieldName is provided

export function gatherFailures<F extends TFieldName, G extends TGroupName>(
  testGroup: TestsContainer<F, G>,
  severityKey: Severity,
  fieldName?: F
): GetFailuresResponse<F, G> {
  return fieldName
    ? getByFieldName<F, G>(testGroup, severityKey, fieldName)
    : collectAll<F, G>(testGroup, severityKey);
}

function getByFieldName<F extends TFieldName, G extends TGroupName>(
  testGroup: TestsContainer<F, G>,
  severityKey: Severity,
  fieldName: F
): SummaryFailure<F, G>[] {
  return testGroup?.[fieldName]?.[severityKey] || [];
}

function collectAll<F extends TFieldName, G extends TGroupName>(
  testGroup: TestsContainer<F, G>,
  severityKey: Severity
): FailureMessages<F, G> {
  const output: FailureMessages<F, G> = {};

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
