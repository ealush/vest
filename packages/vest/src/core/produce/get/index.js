import collectFailureMessages from '../collectFailureMessages';

/**
 * @param {string} suiteId
 * @param {'errors'|'warnings'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns suite or field's errors or warnings.
 */
const get = (state, severityKey, fieldName) => {
  if (!fieldName) {
    return collectFailureMessages(state, severityKey);
  }

  return state.tests?.[fieldName]?.[severityKey] ?? [];
};

export default get;
