import { hasLogic } from '../has';

/**
 * Checks whether there are failures in a given group.
 * @param {Object} state                  Reference to state object.
 * @param {'warn'|'error'} severityKey    Severity filter.
 * @param {string} group                  Group name.
 * @param {string} [fieldName]            Field name.
 * @return {boolean}
 */
const hasByGroup = (state, severityKey, group, fieldName) =>
  state.testObjects.some(testObject => {
    if (group !== testObject.groupName) {
      return false;
    }
    return hasLogic(testObject, severityKey, fieldName);
  });

export default hasByGroup;
