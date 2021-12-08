import hasFailuresLogic from 'hasFailuresLogic';
import { useTestsFlat } from 'stateHooks';
import type { TSeverity } from 'vestTypes';

export function hasErrors(fieldName?: string): boolean {
  return has('errors', fieldName);
}

export function hasWarnings(fieldName?: string): boolean {
  return has('warnings', fieldName);
}

function has(severityKey: TSeverity, fieldName?: string): boolean {
  const testObjects = useTestsFlat();
  return testObjects.some(testObject =>
    hasFailuresLogic(testObject, severityKey, fieldName)
  );
}
