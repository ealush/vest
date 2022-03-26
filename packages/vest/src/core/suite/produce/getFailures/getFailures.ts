import invariant from 'invariant';

import { Severity } from 'Severity';
import { FailureMessages, gatherFailures } from 'collectFailures';
import ctx from 'ctx';

export function getErrors(): FailureMessages;
export function getErrors(fieldName?: string): string[];
export function getErrors(fieldName?: string): string[] | FailureMessages {
  return getFailures(Severity.ERRORS, fieldName);
}

export function getWarnings(): FailureMessages;
export function getWarnings(fieldName?: string): string[];
export function getWarnings(fieldName?: string): string[] | FailureMessages {
  return getFailures(Severity.WARNINGS, fieldName);
}

/**
 * @returns suite or field's errors or warnings.
 */
function getFailures(severityKey: Severity, fieldName?: string) {
  const { summary } = ctx.useX();
  invariant(summary);

  return gatherFailures(summary.tests, severityKey, fieldName);
}
