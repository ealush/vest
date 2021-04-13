import createCache from 'cache';
import isMatchingSeverityProfile from 'isMatchingSeverityProfile';
import { useTestObjects } from 'stateHooks';

const cache = createCache();

/**
 * @param {'warn'|'error'} severity   Filter by severity.
 * @param {Object} options
 * @param {String} [options.group]      Group name for error lookup.
 * @param {String} [options.fieldName]  Field name for error lookup.
 * @returns all messages for given criteria.
 */
const collectFailureMessages = (severity, options) => {
  const [testObjects] = useTestObjects();
  const { group, fieldName } = options || {};

  return cache(
    [testObjects, severity, options],() => {
      const res = testObjects.reduce((collector, testObject) => {
        if (group && testObject.groupName !== group) return collector;
        if (fieldName && testObject.fieldName !== fieldName) return collector;
        if (!testObject.failed) return collector;
        if (isMatchingSeverityProfile(severity, testObject)) return collector;

        collector[testObject.fieldName] = (
          collector[testObject.fieldName] || []
        ).concat(testObject.statement);

        return collector;
      }, {});

      if (fieldName) return res[fieldName] || [];
      return res;
    }
  );
};

export default collectFailureMessages;
