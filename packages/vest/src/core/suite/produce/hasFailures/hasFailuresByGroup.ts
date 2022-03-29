import invariant from 'invariant';
import { isPositive } from 'isPositive';

import { countKeyBySeverity, Severity } from 'Severity';
import ctx from 'ctx';

export function hasErrorsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return has(Severity.ERRORS, groupName, fieldName);
}

export function hasWarningsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return has(Severity.WARNINGS, groupName, fieldName);
}

// eslint-disable-next-line max-statements
function has(
  severityKey: Severity,
  groupName: string,
  fieldName?: string
): boolean {
  const { summary } = ctx.useX();
  invariant(summary);

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
