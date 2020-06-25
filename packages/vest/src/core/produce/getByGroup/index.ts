/* eslint-disable max-params */
import throwError from '../../../lib/throwError';
import collectFailureMessages from '../collectFailureMessages';

/**
 * Gets failure messages by group.
 */
const getByGroup = (
  state: ISuiteState,
  severityKey: SeverityKey,
  group: string,
  fieldName?: string
) => {
  if (!group) {
    throwError(
      `get${severityKey[0].toUpperCase()}${severityKey.slice(
        1
      )}ByGroup requires a group name. Received \`${group}\` instead.`
    );
  }

  const res = collectFailureMessages(state, severityKey, { group, fieldName });

  if (fieldName) {
    // @ts-ignore
    return res[fieldName] || [];
  } else {
    return res;
  }
};

export default getByGroup;
