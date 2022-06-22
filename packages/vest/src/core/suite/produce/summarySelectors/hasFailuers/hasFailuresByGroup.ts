import { isPositive } from 'vest-utils';

import { countKeyBySeverity, Severity } from 'Severity';
import { useSummary } from 'genTestsSummary';

export function hasErrorsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return hasFailuresByGroup(Severity.ERRORS, groupName, fieldName);
}

export function hasWarningsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return hasFailuresByGroup(Severity.WARNINGS, groupName, fieldName);
}

// eslint-disable-next-line max-statements
function hasFailuresByGroup(
  severityKey: Severity,
  groupName: string,
  fieldName?: string
): boolean {
  const summary = useSummary();

  const severityCount = countKeyBySeverity(severityKey);

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
