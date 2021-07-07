import hasFailuresLogic from 'hasFailuresLogic';
import { useTestObjects } from 'stateHooks';
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
  const [testObjects] = useTestObjects();
  return testObjects.some(testObject => {
    if (group !== testObject.groupName) {
      return false;
    }
    return hasFailuresLogic(testObject, severityKey, fieldName);
  });
}
