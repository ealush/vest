import { Severity } from 'Severity';
import hasFailuresLogic from 'hasFailuresLogic';
import { useTestsFlat } from 'stateHooks';

export function hasErrorsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return hasByGroup(Severity.ERRORS, groupName, fieldName);
}

export function hasWarningsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return hasByGroup(Severity.WARNINGS, groupName, fieldName);
}

/**
 * Checks whether there are failures in a given group.
 */
function hasByGroup(
  severityKey: Severity,
  group: string,
  fieldName?: string
): boolean {
  const testObjects = useTestsFlat();
  return testObjects.some(testObject => {
    return group === testObject.groupName
      ? hasFailuresLogic(testObject, severityKey, fieldName)
      : false;
  });
}
