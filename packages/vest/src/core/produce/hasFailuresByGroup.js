import { hasLogic } from 'hasFailures';
import { useTestObjects } from 'stateHooks';

/**
 * Checks whether there are failures in a given group.
 * @param {'errors'|'warnings'} severityKey lookup severity
 * @param {string} group                  Group name.
 * @param {string} [fieldName]            Field name.
 * @return {boolean}
 */
const hasByGroup = (severityKey, group, fieldName) => {
  const [testObjects] = useTestObjects();
  return testObjects.some(testObject => {
    if (group !== testObject.groupName) {
      return false;
    }
    return hasLogic(testObject, severityKey, fieldName);
  });
};

export default hasByGroup;
