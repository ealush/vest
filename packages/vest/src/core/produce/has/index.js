import { SEVERITY_GROUP_WARN } from '../../test/lib/VestTest/constants';
import useTestObjects from '../../test/useTestObjects';

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
