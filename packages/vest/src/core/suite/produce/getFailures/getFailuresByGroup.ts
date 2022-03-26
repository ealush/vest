import invariant from 'invariant';

import { Severity } from 'Severity';
import { gatherFailures } from 'collectFailures';
import ctx from 'ctx';

export function getErrorsByGroup(groupName: string): Record<string, string[]>;
export function getErrorsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getErrorsByGroup(
  groupName: string,
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailuresByGroup(groupName, Severity.ERRORS, fieldName);
}

export function getWarningsByGroup(groupName: string): Record<string, string[]>;
export function getWarningsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getWarningsByGroup(
  groupName: string,
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailuresByGroup(groupName, Severity.WARNINGS, fieldName);
}

function getFailuresByGroup(
  groupName: string,
  severityKey: Severity,
  fieldName?: string
): string[] | Record<string, string[]> {
  const { summary } = ctx.useX();
  invariant(summary);

  return gatherFailures(summary.groups[groupName], severityKey, fieldName);
}
