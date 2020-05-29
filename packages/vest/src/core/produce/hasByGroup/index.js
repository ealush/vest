/**
 * Checks whether there are failures in a given group.
 * @param {Object} state                  Reference to state object.
 * @param {'warn'|'error'} severityKey    Severity filter.
 * @param {string} group                  Grop name.
 * @param {string} [fieldName]            Field name.
 * @return {boolean}
 */
const hasByGroup = (state, severityKey, group, fieldName) => {
  // If no group is provided, or group does not exist
  if (!(group && state.groups[group])) {
    false;
  }

  // If field name is present, check if field has errors
  if (fieldName) {
    return Boolean(state.groups[group][fieldName]?.[severityKey]);
  }

  // If field name is not present, check if there's at least one failure in the group
  for (const fieldName in state.groups[group]) {
    if (state.groups[group][fieldName][severityKey]) {
      return true;
    }
  }

  // No failures
  return false;
};

export default hasByGroup;
