import { isPositive } from 'vest-utils';

import { Severity, SeverityCount } from 'Severity';
import {
  FailureMessages,
  GetFailuresResponse,
  SuiteSummary,
  TFieldName,
  TestsContainer,
} from 'SuiteResultTypes';
import { gatherFailures } from 'collectFailures';

// eslint-disable-next-line max-lines-per-function, max-statements
export function suiteSelectors<F extends TFieldName>(
  summary: SuiteSummary<F>
): SuiteSelectors<F> {
  const selectors = {
    getErrors,
    getErrorsByGroup,
    getWarnings,
    getWarningsByGroup,
    hasErrors,
    hasErrorsByGroup,
    hasWarnings,
    hasWarningsByGroup,
    isValid,
    isValidByGroup,
  };

  return selectors;

  // Booleans

  function isValid(fieldName?: F): boolean {
    return fieldName ? Boolean(summary.tests[fieldName]?.valid) : summary.valid;
  }

  function isValidByGroup(groupName: string, fieldName?: F): boolean {
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

  function hasWarnings(fieldName?: F): boolean {
    return hasFailures(summary, SeverityCount.WARN_COUNT, fieldName);
  }

  function hasErrors(fieldName?: F): boolean {
    return hasFailures(summary, SeverityCount.ERROR_COUNT, fieldName);
  }

  function hasWarningsByGroup(groupName: string, fieldName?: F): boolean {
    return hasFailuresByGroup(
      summary,
      SeverityCount.WARN_COUNT,
      groupName,
      fieldName
    );
  }

  function hasErrorsByGroup(groupName: string, fieldName?: F): boolean {
    return hasFailuresByGroup(
      summary,
      SeverityCount.ERROR_COUNT,
      groupName,
      fieldName
    );
  }

  // Responses

  function getWarnings(): FailureMessages;
  function getWarnings(fieldName: F): string[];
  function getWarnings(fieldName?: F): GetFailuresResponse {
    return getFailures(summary, Severity.WARNINGS, fieldName);
  }

  function getErrors(): FailureMessages;
  function getErrors(fieldName: F): string[];
  function getErrors(fieldName?: F): GetFailuresResponse {
    return getFailures(summary, Severity.ERRORS, fieldName);
  }
  function getErrorsByGroup(groupName: string): FailureMessages;
  function getErrorsByGroup(groupName: string, fieldName: F): string[];
  function getErrorsByGroup(
    groupName: string,
    fieldName?: F
  ): GetFailuresResponse {
    return getFailuresByGroup(summary, Severity.ERRORS, groupName, fieldName);
  }

  function getWarningsByGroup(groupName: string): FailureMessages;
  function getWarningsByGroup(groupName: string, fieldName: F): string[];
  function getWarningsByGroup(
    groupName: string,
    fieldName?: F
  ): GetFailuresResponse {
    return getFailuresByGroup(summary, Severity.WARNINGS, groupName, fieldName);
  }
}

export interface SuiteSelectors<F extends TFieldName> {
  getErrors(fieldName: F): string[];
  getErrors(): FailureMessages;
  getWarnings(): FailureMessages;
  getWarnings(fieldName: F): string[];
  getErrorsByGroup(groupName: string, fieldName: F): string[];
  getErrorsByGroup(groupName: string): FailureMessages;
  getWarningsByGroup(groupName: string): FailureMessages;
  getWarningsByGroup(groupName: string, fieldName: F): string[];
  hasErrors(fieldName?: F): boolean;
  hasWarnings(fieldName?: F): boolean;
  hasErrorsByGroup(groupName: string, fieldName?: F): boolean;
  hasWarningsByGroup(groupName: string, fieldName?: F): boolean;
  isValid(fieldName?: F): boolean;
  isValidByGroup(groupName: string, fieldName?: F): boolean;
}

// Gathers all failures of a given severity
// With a fieldName, it will only gather failures for that field
function getFailures(
  summary: SuiteSummary<TFieldName>,
  severityKey: Severity,
  fieldName?: TFieldName
): GetFailuresResponse {
  return gatherFailures(summary.tests, severityKey, fieldName);
}

// Gathers all failures of a given severity within a group
// With a fieldName, it will only gather failures for that field
function getFailuresByGroup(
  summary: SuiteSummary<TFieldName>,
  severityKey: Severity,
  groupName: string,
  fieldName?: TFieldName
): GetFailuresResponse {
  return gatherFailures(summary.groups[groupName], severityKey, fieldName);
}
// Checks if a field is valid within a container object - can be within a group or top level
function isFieldValid(
  testContainer: TestsContainer<TFieldName>,
  fieldName: TFieldName
): boolean {
  return !!testContainer[fieldName]?.valid;
}

// Checks if a there are any failures of a given severity within a group
// If a fieldName is provided, it will only check for failures within that field
function hasFailuresByGroup(
  summary: SuiteSummary<TFieldName>,
  severityCount: SeverityCount,
  groupName: string,
  fieldName?: TFieldName
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

// Checks if there are any failures of a given severity
// If a fieldName is provided, it will only check for failures within that field
function hasFailures(
  summary: SuiteSummary<TFieldName>,
  countKey: SeverityCount,
  fieldName?: TFieldName
): boolean {
  const failureCount = fieldName
    ? summary.tests[fieldName]?.[countKey]
    : summary[countKey] || 0;

  return isPositive(failureCount);
}
