import id from 'genId';
import { removePending } from 'pending';
import removeTestFromState from 'removeTestFromState';

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

  this.skipped = false;

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
 */
VestTest.prototype.fail = function () {
  this.failed = true;
};

/**
 * Sets a current test's `isWarning` to true.
 */
VestTest.prototype.warn = function () {
  this.isWarning = true;
};

/**
 * Marks a test as canceled, removes it from the state.
 * This function needs to be called within a stateRef context.
 */
VestTest.prototype.cancel = function () {
  this.canceled = true;
  removePending(this);
  removeTestFromState(this);
};

VestTest.prototype.markSkipped = function () {
  this.skipped = true;
};

export default VestTest;
