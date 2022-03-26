import invariant from 'invariant';

import { Severity } from 'Severity';
import { FailureMessages, gatherFailures } from 'collectFailures';
import ctx from 'ctx';

export function getErrorsByGroup(groupName: string): FailureMessages;
export function getErrorsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getErrorsByGroup(
  groupName: string,
  fieldName?: string
): string[] | FailureMessages {
  return getFailuresByGroup(groupName, Severity.ERRORS, fieldName);
}

export function getWarningsByGroup(groupName: string): FailureMessages;
export function getWarningsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getWarningsByGroup(
  groupName: string,
  fieldName?: string
): string[] | FailureMessages {
  return getFailuresByGroup(groupName, Severity.WARNINGS, fieldName);
}

function getFailuresByGroup(
  groupName: string,
  severityKey: Severity,
  fieldName?: string
): string[] | FailureMessages {
  const { summary } = ctx.useX();
  invariant(summary);

  return gatherFailures(summary.groups[groupName], severityKey, fieldName);
}
