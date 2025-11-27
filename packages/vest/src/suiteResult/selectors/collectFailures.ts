import { isPositive, makeResult, Result } from 'vest-utils';

import { countKeyBySeverity, Severity } from '../Severity';
import {
  FailureMessages,
  TestsContainer,
  TFieldName,
  TGroupName,
} from '../SuiteResultTypes';

// calls collectAll or getByFieldName depending on whether fieldName is provided

export function gatherFailures(
  testGroup: TestsContainer<TFieldName, TGroupName>,
  severityKey: Severity,
  fieldName?: TFieldName,
): string[] | FailureMessages {
  return (
    fieldName
      ? getByFieldName(testGroup, severityKey, fieldName)
      : collectAll(testGroup, severityKey)
  ).unwrap();
}

function getByFieldName(
  testGroup: TestsContainer<TFieldName, TGroupName>,
  severityKey: Severity,
  fieldName: TFieldName,
): Result<string[]> {
  return makeResult.Ok(testGroup?.[fieldName]?.[severityKey] || []);
}

function collectAll(
  testGroup: TestsContainer<TFieldName, TGroupName>,
  severityKey: Severity,
): Result<FailureMessages> {
  const output: FailureMessages = {};

  const countKey = countKeyBySeverity(severityKey);

  for (const field in testGroup) {
    if (isPositive(testGroup[field as TFieldName][countKey])) {
      // We will probably never get to the fallback array
      // leaving it just in case the implementation changes
      output[field] = testGroup[field as TFieldName][severityKey] || [];
    }
  }

  return makeResult.Ok(output);
}
