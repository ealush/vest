import throwError from '../../../lib/throwError';
import collectFailureMessages from '../collectFailureMessages';

/**
 * Gets failure messages by group.
 * @param {'warn'|'error'} severityKey    Severity filter.
 * @param {string} group                  Group name.
 * @param {string} [fieldName]            Field name.
 */
const getByGroup = (severityKey, group, fieldName) => {
  if (!group) {
    throwError(
      `get${severityKey[0].toUpperCase()}${severityKey.slice(
        1
      )}ByGroup requires a group name. Received \`${group}\` instead.`
    );
  }

  const res = collectFailureMessages(severityKey, { group, fieldName });

  if (fieldName) {
    return res[fieldName] || [];
  } else {
    return res;
  }
};

export default getByGroup;
