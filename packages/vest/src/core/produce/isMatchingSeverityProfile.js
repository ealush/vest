import { SEVERITY_GROUP_WARN } from 'resultKeys';

/**
 * Checks that a given test object matches the currently specified severity level
 * @param {string} severity       Represents severity level
 * @param {VestTest} testObject   VestTest instance
 * @returns {boolean}
 */
export default function isMatchingSeverityProfile(severity, testObject) {
  return (
    (severity !== SEVERITY_GROUP_WARN && testObject.isWarning) ||
    (severity === SEVERITY_GROUP_WARN && !testObject.isWarning)
  );
}
