import id from '../../../../lib/id';

/**
 * Describes a test call inside a Vest suite.
 * @param {String} fieldName            Name of the field being tested.
 * @param {String} statement            The message returned when failing.
 * @param {Promise|Function} testFn     The actual test callback or promise.
 * @param {string} [group]              The group in which the test runs.
 */
function VestTest({ fieldName, statement, testFn, group }) {
  Object.assign(this, {
    failed: false,
    fieldName,
    id: id(),
    isWarning: false,
    statement,
    testFn,
  });

  if (group) {
    this.groupName = group;
  }
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
