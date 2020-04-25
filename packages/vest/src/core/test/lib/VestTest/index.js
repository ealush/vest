import id from '../../../../lib/id';
import patch from '../../../state/patch';

/**
 * Describes a test call inside a Vest suite.
 * @param {String} suiteId              Suite Id.
 * @param {String} fieldName            Name of the field being tested.
 * @param {String} statement            The message returned when failing.
 * @param {Promise|Function} testFn     The actual test callbrack or promise.
 */
function VestTest(suiteId, fieldName, statement, testFn) {
  Object.assign(this, {
    suiteId,
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
  const { fieldName, statement, isWarning } = this;

  let severityGroup, severityCount;

  if (isWarning) {
    severityGroup = 'warnings';
    severityCount = 'warnCount';
  } else {
    severityGroup = 'errors';
    severityCount = 'errorCount';
  }

  patch(this.suiteId, state => {
    if (!state.tests[this.fieldName]) {
      return state;
    }

    const nextState = { ...state };

    nextState.tests[fieldName][severityGroup] =
      state.tests[fieldName][severityGroup] || [];

    if (statement) {
      nextState.tests[fieldName][severityGroup].push(statement);
    }

    nextState[severityCount]++;
    nextState.tests[fieldName][severityCount]++;

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
