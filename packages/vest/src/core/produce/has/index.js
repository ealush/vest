import { SEVERITY_GROUP_WARN } from '../../test/lib/VestTest/constants';

/**
 * Determines whether a certain test profile has failures.
 * @param {VestTest} testObject
 * @param {'warnings'|'errors'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns {Boolean}
 */
export const hasLogic = (testObject, severityKey, fieldName) => {
  if (!testObject.failed) {
    return false;
  }

  if (fieldName && fieldName !== testObject.fieldName) {
    return false;
  }

  if (
    (severityKey === SEVERITY_GROUP_WARN && !testObject.isWarning) ||
    (severityKey !== SEVERITY_GROUP_WARN && testObject.isWarning)
  ) {
    return false;
  }

  return true;
};

/**
 * @param {Object} Suite State
 * @param {'warnings'|'errors'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns {Boolean} whether a suite or field have errors or warnings.
 */
const has = (state, severityKey, fieldName) =>
  state.testObjects.some(testObject =>
    hasLogic(testObject, severityKey, fieldName)
  );

export default has;
