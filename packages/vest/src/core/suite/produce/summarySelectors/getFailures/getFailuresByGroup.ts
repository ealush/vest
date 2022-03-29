import { Severity } from 'Severity';
import { FailureMessages, gatherFailures } from 'collectFailures';
import { useSummary } from 'genTestsSummary';

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
  const summary = useSummary();

  return gatherFailures(summary.groups[groupName], severityKey, fieldName);
}
