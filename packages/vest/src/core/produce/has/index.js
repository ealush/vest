/**
 * @param {string} suiteId
 * @param {'errorCount'|'warnCount'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns {Boolean} whether a suite or field have errors or warnings.
 */
const has = (state, severityKey, fieldName) => {
  if (!fieldName) {
    return Boolean(state?.[severityKey]);
  }
  return Boolean(state?.tests?.[fieldName]?.[severityKey]);
};

export default has;
