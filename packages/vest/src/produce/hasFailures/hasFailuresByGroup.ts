import hasFailuresLogic from 'hasFailuresLogic';
import { useTestsFlat } from 'stateHooks';
import type { TSeverity } from 'vestTypes';

export function hasErrorsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return hasByGroup('errors', groupName, fieldName);
}

export function hasWarningsByGroup(
  groupName: string,
  fieldName?: string
): boolean {
  return hasByGroup('warnings', groupName, fieldName);
}

/**
 * Checks whether there are failures in a given group.
 */
function hasByGroup(
  severityKey: TSeverity,
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
