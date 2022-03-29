import invariant from 'invariant';
import { isPositive } from 'isPositive';

import { countKeyBySeverity, Severity } from 'Severity';
import ctx from 'ctx';
import hasFailuresLogic from 'hasFailuresLogic';
import { useTestsFlat } from 'stateHooks';

export function hasErrors(fieldName?: string): boolean {
  return has(Severity.ERRORS, fieldName);
}

export function hasWarnings(fieldName?: string): boolean {
  return has(Severity.WARNINGS, fieldName);
}

function has(severityKey: Severity, fieldName?: string): boolean {
  const { summary } = ctx.useX();
  invariant(summary);

  const severityCount = countKeyBySeverity(severityKey);

  if (fieldName) {
    return isPositive(summary.tests[fieldName]?.[severityCount]);
  }

  return isPositive(summary[severityCount]);
}

export function hasFailures(
  severityKey: Severity,
  fieldName?: string
): boolean {
  const testObjects = useTestsFlat();
  return testObjects.some(testObject =>
    hasFailuresLogic(testObject, severityKey, fieldName)
  );
}
