import { isPositive } from 'vest-utils';

import { SeverityCount } from 'Severity';
import { useSummary } from 'genTestsSummary';

export function hasErrors(fieldName?: string): boolean {
  return hasFailures(SeverityCount.ERROR_COUNT, fieldName);
}

export function hasWarnings(fieldName?: string): boolean {
  return hasFailures(SeverityCount.WARN_COUNT, fieldName);
}

function hasFailures(
  severityCount: SeverityCount,
  fieldName?: string
): boolean {
  const summary = useSummary();

  if (fieldName) {
    return isPositive(summary.tests[fieldName]?.[severityCount]);
  }

  return isPositive(summary[severityCount]);
}
