import isMatchingSeverityProfile from 'isMatchingSeverityProfile';
import { useTestObjects } from 'stateHooks';

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

  if (isMatchingSeverityProfile(severityKey, testObject)) {
    return false;
  }

  return true;
};

/**
 * @param {'warnings'|'errors'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns {Boolean} whether a suite or field have errors or warnings.
 */
const has = (severityKey, fieldName) => {
  const [testObjects] = useTestObjects();
  return testObjects.some(testObject =>
    hasLogic(testObject, severityKey, fieldName)
  );
};

export default has;
