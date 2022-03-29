import { isPositive } from 'isPositive';

import { countKeyBySeverity, Severity } from 'Severity';
import { useSummary } from 'genTestsSummary';

export function hasErrors(fieldName?: string): boolean {
  return hasFailures(Severity.ERRORS, fieldName);
}

export function hasWarnings(fieldName?: string): boolean {
  return hasFailures(Severity.WARNINGS, fieldName);
}

function hasFailures(severityKey: Severity, fieldName?: string): boolean {
  const summary = useSummary();

  const severityCount = countKeyBySeverity(severityKey);

  if (fieldName) {
    return isPositive(summary.tests[fieldName]?.[severityCount]);
  }

  return isPositive(summary[severityCount]);
}
