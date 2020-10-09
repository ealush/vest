import collectFailureMessages from '../collectFailureMessages';

/**
 * @param {'errors'|'warnings'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns suite or field's errors or warnings.
 */
const get = (severityKey, fieldName) => {
  const res = collectFailureMessages(severityKey, { fieldName });

  if (fieldName) {
    return res[fieldName] || [];
  } else {
    return res;
  }
};

export default get;
