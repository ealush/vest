import { SEVERITY_GROUP_WARN } from '../../test/lib/VestTest/constants';

/**
 * @param {Object} State            State Object reference
 * @param {'warn'|'error'} severity   Filter by severity.
 * @param {Object} options
 * @param {String} [options.group]      Group name for error lookup.
 * @param {String} [options.fieldName]  Field name for error lookup.
 * @returns all messages for given criteria.
 */
const collectFailureMessages = (state, severity, { group, fieldName } = {}) =>
  state.testObjects.reduce((collector, testObject) => {
    if (group && testObject.groupName !== group) {
      return collector;
    }

    if (fieldName && testObject.fieldName !== fieldName) {
      return collector;
    }

    if (!testObject.failed) {
      return collector;
    }

    if (
      (severity !== SEVERITY_GROUP_WARN && testObject.isWarning) ||
      (severity === SEVERITY_GROUP_WARN && !testObject.isWarning)
    ) {
      return collector;
    }

    collector[testObject.fieldName] = (
      collector[testObject.fieldName] || []
    ).concat(testObject.statement);

    return collector;
  }, {});

export default collectFailureMessages;
