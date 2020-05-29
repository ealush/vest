import id from '../../../../lib/id';
import patch from '../../../state/patch';
import {
  SEVERITY_GROUP_WARN,
  SEVERITY_COUNT_WARN,
  SEVERITY_GROUP_ERROR,
  SEVERITY_COUNT_ERROR,
} from './constants';

/**
 * Describes a test call inside a Vest suite.
 * @param {String} suiteId              Suite Id.
 * @param {String} fieldName            Name of the field being tested.
 * @param {String} statement            The message returned when failing.
 * @param {Promise|Function} testFn     The actual test callback or promise.
 * @param {string} [group]              The group in which the test runs.
 */
function VestTest({ suiteId, fieldName, statement, testFn, group }) {
  Object.assign(this, {
    suiteId,
    group,
    testFn,
    fieldName,
    statement,
    isWarning: false,
    failed: false,
    id: id(),
  });
}

/**
 * @returns {Boolean} Current validity status of a test.
 */
VestTest.prototype.valueOf = function () {
  return this.failed !== true;
};

/**
 * Sets a test to failed.
 * @returns {VestTest} Current instance.
 */
VestTest.prototype.fail = function () {
  const { fieldName, statement, isWarning, suiteId, group } = this;

  let severityGroup, severityCount;

  if (isWarning) {
    severityGroup = SEVERITY_GROUP_WARN;
    severityCount = SEVERITY_COUNT_WARN;
  } else {
    severityGroup = SEVERITY_GROUP_ERROR;
    severityCount = SEVERITY_COUNT_ERROR;
  }

  patch(suiteId, state => {
    if (!state.tests[fieldName]) {
      return state;
    }

    const nextState = { ...state };
    const objectsToBump = [nextState.tests[fieldName]];

    if (group && nextState.groups[group][fieldName] !== undefined) {
      objectsToBump.push(nextState.groups[group][fieldName]);
    }

    objectsToBump.forEach(obj => {
      obj[severityGroup] = obj[severityGroup] || [];

      if (statement) {
        obj[severityGroup].push(statement);
      }

      obj[severityCount]++;
    });

    nextState[severityCount]++;

    return nextState;
  });

  this.failed = true;
  return this;
};

/**
 * Sets a current test's `isWarning` to true.
 * @returns {VestTest} Current instance.
 */
VestTest.prototype.warn = function () {
  this.isWarning = true;
  return this;
};

export default VestTest;
