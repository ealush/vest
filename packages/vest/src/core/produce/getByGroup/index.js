import throwError from '../../../lib/throwError';
import collectFailureMessages from '../collectFailureMessages';

/**
 * Gets failure messages by group.
 * @param {Object} state                  Reference to state object.
 * @param {'warn'|'error'} severityKey    Severity filter.
 * @param {string} group                  Grop name.
 * @param {string} [fieldName]            Field name.
 */
const getByGroup = (state, severityKey, group, fieldName) => {
  if (!group) {
    throwError(
      `get${severityKey[0].toUpperCase()}${severityKey.slice(
        1
      )}ByGroup requires a group name. Recieved \`${group}\` instead.`
    );
  }

  if (!fieldName) {
    return collectFailureMessages(state, severityKey, group);
  }

  return state.groups?.[group]?.[fieldName]?.[severityKey] || [];
};

export default getByGroup;
