import { Severity } from 'Severity';
import hasFailuresLogic from 'hasFailuresLogic';
import { useTestsFlat } from 'stateHooks';

export function hasErrors(fieldName?: string): boolean {
  return has(Severity.ERRORS, fieldName);
}

export function hasWarnings(fieldName?: string): boolean {
  return has(Severity.WARNINGS, fieldName);
}

function has(severityKey: Severity, fieldName?: string): boolean {
  const testObjects = useTestsFlat();
  return testObjects.some(testObject =>
    hasFailuresLogic(testObject, severityKey, fieldName)
  );
}
