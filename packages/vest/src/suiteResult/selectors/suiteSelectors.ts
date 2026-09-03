import {
  Maybe,
  greaterThan,
  isPositive,
  isStringValue,
  makeBrand,
  makeResult,
  Result,
} from 'vest-utils';

import matchingFieldName from '../../core/test/helpers/matchingFieldName';
import { Severity, SeverityCount } from '../Severity';
import {
  FailureMessages,
  GetFailuresResponse,
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
  TSchema,
} from '../SuiteResultTypes';
import { SummaryFailure } from '../SummaryFailure';

import { gatherFailures } from './collectFailures';

/**
 * Selectors accept top-level field names plus `${field}.${string}` dotted
 * paths so nested schema failures (e.g. 'profile.state') are queryable.
 * Deliberate tradeoff: an unknown dotted path also typechecks and, because
 * runtime matching is exact, reports no errors instead of failing to compile.
 */
type InputFieldName<F extends TFieldName> = F | `${F}.${string}`;
type InputGroupName<G extends TGroupName> = G;

export function bindSuiteSelectors<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
>(get: () => SuiteResult<F, G, S>): SuiteSelectors<F, G> {
  return {
    getError: (...args: Parameters<SuiteSelectors<F, G>['getError']>) =>
      get().getError(...args),
    getErrors: (...args: Parameters<SuiteSelectors<F, G>['getErrors']>) =>
      get().getErrors(...args),
    getErrorsByGroup: (
      ...args: Parameters<SuiteSelectors<F, G>['getErrorsByGroup']>
    ) => get().getErrorsByGroup(...args),
    getMessage: (...args: Parameters<SuiteSelectors<F, G>['getMessage']>) =>
      get().getMessage(...args),
    getWarning: (...args: Parameters<SuiteSelectors<F, G>['getWarning']>) =>
      get().getWarning(...args),
    getWarnings: (...args: Parameters<SuiteSelectors<F, G>['getWarnings']>) =>
      get().getWarnings(...args),
    getWarningsByGroup: (
      ...args: Parameters<SuiteSelectors<F, G>['getWarningsByGroup']>
    ) => get().getWarningsByGroup(...args),
    hasErrors: (...args: Parameters<SuiteSelectors<F, G>['hasErrors']>) =>
      get().hasErrors(...args),
    hasErrorsByGroup: (
      ...args: Parameters<SuiteSelectors<F, G>['hasErrorsByGroup']>
    ) => get().hasErrorsByGroup(...args),
    hasWarnings: (...args: Parameters<SuiteSelectors<F, G>['hasWarnings']>) =>
      get().hasWarnings(...args),
    hasWarningsByGroup: (
      ...args: Parameters<SuiteSelectors<F, G>['hasWarningsByGroup']>
    ) => get().hasWarningsByGroup(...args),
    isPending: (...args: Parameters<SuiteSelectors<F, G>['isPending']>) =>
      get().isPending(...args),
    isTested: (...args: Parameters<SuiteSelectors<F, G>['isTested']>) =>
      get().isTested(...args),
    isValid: (...args: Parameters<SuiteSelectors<F, G>['isValid']>) =>
      get().isValid(...args),
    isValidByGroup: (
      ...args: Parameters<SuiteSelectors<F, G>['isValidByGroup']>
    ) => get().isValidByGroup(...args),
  } as SuiteSelectors<F, G>;
}

// eslint-disable-next-line max-lines-per-function, max-statements
export function suiteSelectors<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>,
): SuiteSelectors<F, G> {
  const selectors = {
    getError,
    getErrors,
    getErrorsByGroup,
    getMessage,
    getWarning,
    getWarnings,
    getWarningsByGroup,
    hasErrors,
    hasErrorsByGroup,
    hasWarnings,
    hasWarningsByGroup,
    isPending,
    isTested,
    isValid,
    isValidByGroup,
  };

  return selectors;

  function asFieldName(fieldName?: InputFieldName<F>): F | undefined {
    if (isStringValue(fieldName)) {
      return makeBrand<TFieldName>(fieldName) as F;
    }

    return fieldName;
  }

  function asGroupName(groupName: InputGroupName<G>): G {
    if (isStringValue(groupName)) {
      return makeBrand<TGroupName>(groupName) as G;
    }

    return groupName;
  }

  // Booleans

  function isValid(fieldName?: InputFieldName<F>): boolean {
    const targetFieldName = asFieldName(fieldName);

    return Boolean(
      targetFieldName ? summary.tests[targetFieldName]?.valid : summary.valid,
    );
  }

  // eslint-disable-next-line max-statements, complexity
  function isValidByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): boolean {
    if (
      summary.valid === null ||
      (!summary.testCount &&
        !Object.keys(summary.tests).length &&
        !Object.keys(summary.groups).length)
    ) {
      return false;
    }

    const safeGroupName = asGroupName(groupName);
    const safeFieldName = asFieldName(fieldName);
    const group = summary.groups[safeGroupName];

    // If the group doesn't exist, it is vacuously valid in this selector.
    if (!group) {
      return true;
    }

    // If checking a specific field within the group
    if (safeFieldName) {
      const fieldSummary = group[safeFieldName];
      // If field doesn't exist in group, it's invalid (test was never run)
      if (!fieldSummary) {
        return false;
      }
      return !!fieldSummary.valid;
    }

    // Check all fields in the group
    let hasAnyFields = false;
    for (const fieldName of Object.keys(group) as F[]) {
      hasAnyFields = true;
      if (!group[fieldName]?.valid) {
        return false;
      }
    }

    return hasAnyFields;
  }

  function hasErrors(fieldName?: InputFieldName<F>): boolean {
    return hasFailures(
      summary,
      SeverityCount.ERROR_COUNT,
      asFieldName(fieldName),
    ).unwrap();
  }

  function hasWarnings(fieldName?: InputFieldName<F>): boolean {
    return hasFailures(
      summary,
      SeverityCount.WARN_COUNT,
      asFieldName(fieldName),
    ).unwrap();
  }

  function isTested(fieldName: InputFieldName<F>): boolean {
    const safeFieldName = asFieldName(fieldName);

    return safeFieldName
      ? isPositive(summary.tests[safeFieldName]?.testCount)
      : false;
  }

  function hasWarningsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): boolean {
    return hasFailuresByGroup(
      summary,
      SeverityCount.WARN_COUNT,
      asGroupName(groupName),
      asFieldName(fieldName),
    ).unwrap();
  }

  function hasErrorsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): boolean {
    return hasFailuresByGroup(
      summary,
      SeverityCount.ERROR_COUNT,
      asGroupName(groupName),
      asFieldName(fieldName),
    ).unwrap();
  }

  // Responses

  function getWarnings(): FailureMessages;
  function getWarnings(fieldName: InputFieldName<F>): string[];
  function getWarnings(fieldName?: InputFieldName<F>): GetFailuresResponse {
    return getFailures(
      summary,
      Severity.WARNINGS,
      asFieldName(fieldName),
    ).unwrap();
  }

  function getWarning(): Maybe<SummaryFailure<F, G>>;
  function getWarning(fieldName: InputFieldName<F>): Maybe<string>;
  function getWarning(
    fieldName?: InputFieldName<F>,
  ): Maybe<SummaryFailure<F, G> | string> {
    const safeFieldName = asFieldName(fieldName);

    return (
      safeFieldName
        ? getFailure<F, G>(Severity.WARNINGS, summary, safeFieldName)
        : getFailure<F, G>(Severity.WARNINGS, summary)
    ).unwrap();
  }

  function getErrors(): FailureMessages;
  function getErrors(fieldName: InputFieldName<F>): string[];
  function getErrors(fieldName?: InputFieldName<F>): GetFailuresResponse {
    return getFailures(
      summary,
      Severity.ERRORS,
      asFieldName(fieldName),
    ).unwrap();
  }

  function getError(): Maybe<SummaryFailure<F, G>>;
  function getError(fieldName: InputFieldName<F>): Maybe<string>;
  function getError(
    fieldName?: InputFieldName<F>,
  ): Maybe<SummaryFailure<F, G> | string> {
    const safeFieldName = asFieldName(fieldName);

    return (
      safeFieldName
        ? getFailure<F, G>(Severity.ERRORS, summary, safeFieldName)
        : getFailure<F, G>(Severity.ERRORS, summary)
    ).unwrap();
  }

  function getErrorsByGroup(groupName: InputGroupName<G>): FailureMessages;
  function getErrorsByGroup(
    groupName: InputGroupName<G>,
    fieldName: InputFieldName<F>,
  ): string[];
  function getErrorsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): GetFailuresResponse {
    return getFailuresByGroup(
      summary,
      Severity.ERRORS,
      asGroupName(groupName),
      asFieldName(fieldName),
    ).unwrap();
  }

  function getMessage(fieldName: InputFieldName<F>): Maybe<string> {
    return getError(fieldName) || getWarning(fieldName);
  }

  function getWarningsByGroup(groupName: InputGroupName<G>): FailureMessages;
  function getWarningsByGroup(
    groupName: InputGroupName<G>,
    fieldName: InputFieldName<F>,
  ): string[];
  function getWarningsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): GetFailuresResponse {
    return getFailuresByGroup(
      summary,
      Severity.WARNINGS,
      asGroupName(groupName),
      asFieldName(fieldName),
    ).unwrap();
  }

  function isPending(fieldName?: InputFieldName<F>): boolean {
    const safeFieldName = asFieldName(fieldName);

    return safeFieldName
      ? greaterThan(summary.tests[safeFieldName]?.pendingCount, 0)
      : greaterThan(summary.pendingCount, 0);
  }
}

export interface SuiteSelectors<F extends TFieldName, G extends TGroupName> {
  getWarning(): SummaryFailure<F, G> | undefined;
  getWarning(fieldName: InputFieldName<F>): string | undefined;
  getWarning(
    fieldName?: InputFieldName<F>,
  ): SummaryFailure<F, G> | string | undefined;
  getError(): SummaryFailure<F, G> | undefined;
  getError(fieldName: InputFieldName<F>): string | undefined;
  getError(
    fieldName?: InputFieldName<F>,
  ): SummaryFailure<F, G> | string | undefined;
  getMessage(fieldName: InputFieldName<F>): string | undefined;
  getErrors(): FailureMessages;
  getErrors(fieldName: InputFieldName<F>): string[];
  getErrors(fieldName?: InputFieldName<F>): string[] | FailureMessages;
  getWarnings(): FailureMessages;
  getWarnings(fieldName: InputFieldName<F>): string[];
  getWarnings(fieldName?: InputFieldName<F>): string[] | FailureMessages;
  getErrorsByGroup(groupName: InputGroupName<G>): FailureMessages;
  getErrorsByGroup(
    groupName: InputGroupName<G>,
    fieldName: InputFieldName<F>,
  ): string[];
  getErrorsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): string[] | FailureMessages;
  getWarningsByGroup(groupName: InputGroupName<G>): FailureMessages;
  getWarningsByGroup(
    groupName: InputGroupName<G>,
    fieldName: InputFieldName<F>,
  ): string[];
  getWarningsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): string[] | FailureMessages;
  hasErrors(fieldName?: InputFieldName<F>): boolean;
  hasWarnings(fieldName?: InputFieldName<F>): boolean;
  hasErrorsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): boolean;
  hasWarningsByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): boolean;
  isTested(fieldName: InputFieldName<F>): boolean;
  isPending(fieldName?: InputFieldName<F>): boolean;
  isValid(fieldName?: InputFieldName<F>): boolean;
  isValidByGroup(
    groupName: InputGroupName<G>,
    fieldName?: InputFieldName<F>,
  ): boolean;
}

// Gathers all failures of a given severity
// With a fieldName, it will only gather failures for that field
function getFailures<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>,
  severityKey: Severity,
): Result<FailureMessages>;
function getFailures<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>,
  severityKey: Severity,
  fieldName?: TFieldName,
): Result<string[]>;
function getFailures<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>,
  severityKey: Severity,
  fieldName?: TFieldName,
): Result<GetFailuresResponse> {
  return makeResult.Ok(gatherFailures(summary.tests, severityKey, fieldName));
}

// Gathers all failures of a given severity within a group
// With a fieldName, it will only gather failures for that field
function getFailuresByGroup(
  summary: SuiteSummary<TFieldName, TGroupName>,
  severityKey: Severity,
  groupName: TGroupName,
  fieldName?: TFieldName,
): Result<GetFailuresResponse> {
  return makeResult.Ok(
    gatherFailures(summary.groups[groupName], severityKey, fieldName),
  );
}

// Checks if a there are any failures of a given severity within a group
// If a fieldName is provided, it will only check for failures within that field
// eslint-disable-next-line complexity
function hasFailuresByGroup<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>,
  severityCount: SeverityCount,
  groupName: G,
  fieldName?: F,
): Result<boolean> {
  const group = summary.groups[groupName];

  if (!group) {
    return makeResult.Ok(false);
  }

  if (fieldName) {
    return makeResult.Ok(isPositive(group[fieldName]?.[severityCount]));
  }

  for (const field in group) {
    if (isPositive(group[field as unknown as F]?.[severityCount])) {
      return makeResult.Ok(true);
    }
  }

  return makeResult.Ok(false);
}

// Checks if there are any failures of a given severity
// If a fieldName is provided, it will only check for failures within that field
function hasFailures(
  summary: SuiteSummary<TFieldName, TGroupName>,
  countKey: SeverityCount,
  fieldName?: TFieldName,
): Result<boolean> {
  const failureCount = fieldName
    ? summary.tests[fieldName]?.[countKey]
    : summary[countKey] || 0;

  return makeResult.Ok(isPositive(failureCount));
}

function getFailure<F extends TFieldName, G extends TGroupName>(
  severity: Severity,
  summary: SuiteSummary<F, G>,
): Result<Maybe<SummaryFailure<F, G>>>;
function getFailure<F extends TFieldName, G extends TGroupName>(
  severity: Severity,
  summary: SuiteSummary<F, G>,
  fieldName: F,
): Result<Maybe<string>>;
function getFailure<F extends TFieldName, G extends TGroupName>(
  severity: Severity,
  summary: SuiteSummary<F, G>,
  fieldName?: F,
): Result<Maybe<SummaryFailure<F, G> | string>> {
  const summaryKey = summary[severity];

  if (!fieldName) {
    return makeResult.Ok(summaryKey[0]);
  }

  return makeResult.Ok(
    summaryKey.find((summaryFailure: SummaryFailure<TFieldName, TGroupName>) =>
      matchingFieldName(summaryFailure, fieldName).unwrap(),
    )?.message,
  );
}
