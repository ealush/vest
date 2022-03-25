import invariant from 'invariant';

import { Severity } from 'Severity';
import { getByFieldName, collectAll } from 'collectFailures';
import ctx from 'ctx';

export function getErrors(): Record<string, string[]>;
export function getErrors(fieldName?: string): string[];
export function getErrors(
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailures(Severity.ERRORS, fieldName);
}

export function getWarnings(): Record<string, string[]>;
export function getWarnings(fieldName?: string): string[];
export function getWarnings(
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailures(Severity.WARNINGS, fieldName);
}

/**
 * @returns suite or field's errors or warnings.
 */
function getFailures(severityKey: Severity, fieldName?: string) {
  const { summary } = ctx.useX();
  invariant(summary);
  return fieldName
    ? getByFieldName(summary.tests, severityKey, fieldName)
    : collectAll(summary.tests, severityKey);
}
