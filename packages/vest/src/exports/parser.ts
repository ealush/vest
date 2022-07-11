import hasOwnProperty from 'hasOwnProperty';
import invariant from 'invariant';
import { isPositive } from 'isPositive';

import { Severity, SeverityCount } from 'Severity';
import { SuiteSummary, TestsContainer } from 'SuiteSummaryTypes';
import {
  FailureMessages,
  gatherFailures,
  GetFailuresResponse,
} from 'collectFailures';
import { VestResultMethods } from 'produceSuiteResult';

// eslint-disable-next-line max-lines-per-function, max-statements
export function parse(summary: SuiteSummary): ParsedVestObject {
  invariant(
    summary && hasOwnProperty(summary, 'valid'),
    "Vest parser: expected argument at position 0 to be Vest's result object."
  );

  const testedStorage: Record<string, boolean> = {};

  const selectors = {
    getErrors,
    getErrorsByGroup,
    getWarnings,
    getWarningsByGroup,
    hasErrors,
    hasErrorsByGroup,
    hasWarnings,
    hasWarningsByGroup,
    invalid: hasErrors,
    isValid,
    isValidByGroup,
    tested: isTested,
    untested: isUntested,
    valid: isValid,
    warning: hasWarnings,
  };

  return selectors;

  // Booleans
  function isTested(fieldName?: string): boolean {
    if (!fieldName) {
      return isPositive(summary.testCount);
    }

    if (hasOwnProperty(testedStorage, fieldName))
      return testedStorage[fieldName];

    testedStorage[fieldName] =
      hasOwnProperty(summary.tests, fieldName) &&
      isPositive(summary.tests[fieldName].testCount);

    return selectors.tested(fieldName);
  }

  function isUntested(fieldName?: string): boolean {
    return !(isPositive(summary.testCount) && selectors.tested(fieldName));
  }

  function isValid(fieldName?: string): boolean {
    return fieldName ? Boolean(summary.tests[fieldName]?.valid) : summary.valid;
  }

  function isValidByGroup(groupName: string, fieldName?: string): boolean {
    const group = summary.groups[groupName];

    if (!group) {
      return false;
    }

    if (fieldName) {
      return isFieldValid(group, fieldName);
    }

    for (const fieldName in group) {
      if (!isFieldValid(group, fieldName)) {
        return false;
      }
    }

    return true;
  }

  function hasWarnings(fieldName?: string): boolean {
    return hasFailures(summary, SeverityCount.WARN_COUNT, fieldName);
  }

  function hasErrors(fieldName?: string): boolean {
    return hasFailures(summary, SeverityCount.ERROR_COUNT, fieldName);
  }

  function hasWarningsByGroup(groupName: string, fieldName?: string): boolean {
    return hasFailuresByGroup(
      summary,
      SeverityCount.WARN_COUNT,
      groupName,
      fieldName
    );
  }

  function hasErrorsByGroup(groupName: string, fieldName?: string): boolean {
    return hasFailuresByGroup(
      summary,
      SeverityCount.ERROR_COUNT,
      groupName,
      fieldName
    );
  }

  // Responses

  function getWarnings(): FailureMessages;
  function getWarnings(fieldName: string): string[];
  function getWarnings(fieldName?: string): GetFailuresResponse {
    return getFailures(summary, Severity.WARNINGS, fieldName);
  }

  function getErrors(): FailureMessages;
  function getErrors(fieldName: string): string[];
  function getErrors(fieldName?: string): GetFailuresResponse {
    return getFailures(summary, Severity.ERRORS, fieldName);
  }
  function getErrorsByGroup(groupName: string): FailureMessages;
  function getErrorsByGroup(groupName: string, fieldName: string): string[];
  function getErrorsByGroup(
    groupName: string,
    fieldName?: string
  ): GetFailuresResponse {
    return getFailuresByGroup(summary, Severity.ERRORS, groupName, fieldName);
  }

  function getWarningsByGroup(groupName: string): FailureMessages;
  function getWarningsByGroup(groupName: string, fieldName: string): string[];
  function getWarningsByGroup(
    groupName: string,
    fieldName?: string
  ): GetFailuresResponse {
    return getFailuresByGroup(summary, Severity.WARNINGS, groupName, fieldName);
  }
}

function getFailures(
  summary: SuiteSummary,
  severityKey: Severity,
  fieldName?: string
): GetFailuresResponse {
  return gatherFailures(summary.tests, severityKey, fieldName);
}

function getFailuresByGroup(
  summary: SuiteSummary,
  severityKey: Severity,
  groupName: string,
  fieldName?: string
): GetFailuresResponse {
  return gatherFailures(summary.groups[groupName], severityKey, fieldName);
}

function isFieldValid(
  testContainer: TestsContainer,
  fieldName: string
): boolean {
  return !!testContainer[fieldName]?.valid;
}

function hasFailuresByGroup(
  summary: SuiteSummary,
  severityCount: SeverityCount,
  groupName: string,
  fieldName?: string
): boolean {
  const group = summary.groups[groupName];

  if (!group) {
    return false;
  }

  if (fieldName) {
    return isPositive(group[fieldName]?.[severityCount]);
  }

  for (const field in group) {
    if (isPositive(group[field]?.[severityCount])) {
      return true;
    }
  }

  return false;
}

function hasFailures(
  summary: SuiteSummary,
  countKey: SeverityCount,
  fieldName?: string
): boolean {
  const failureCount = fieldName
    ? summary.tests[fieldName]?.[countKey]
    : summary[countKey] || 0;

  return isPositive(failureCount);
}

interface ParsedVestObject extends VestResultMethods {
  valid(fieldName?: string): boolean;
  tested(fieldName?: string): boolean;
  invalid(fieldName?: string): boolean;
  untested(fieldName?: string): boolean;
  warning(fieldName?: string): boolean;
}
