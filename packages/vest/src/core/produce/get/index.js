import collectFailureMessages from '../collectFailureMessages';

/**
 * @param {string} suiteId
 * @param {'errors'|'warnings'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns suite or field's errors or warnings.
 */
const get = (state, severityKey, fieldName) => {
  const res = collectFailureMessages(state, severityKey, { fieldName });

  if (fieldName) {
    return res[fieldName] || [];
  } else {
    return res;
  }
};

export default get;
