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
  const testObject = {
    cancel,
    fail,
    failed: false,
    fieldName,
    id: id(),
    isWarning: false,
    statement,
    testFn,
    valueOf,
    warn,
  };

  if (group) {
    testObject.groupName = group;
  }

  return testObject;

  /**
   * @returns {Boolean} Current validity status of a test.
   */
  function valueOf() {
    return testObject.failed !== true;
  }

  /**
   * Sets a test to failed.
   */
  function fail() {
    testObject.failed = true;
  }

  /**
   * Sets a current test's `isWarning` to true.
   */
  function warn() {
    testObject.isWarning = true;
  }

  /**
   * Marks a test as canceled, removes it from the state.
   * This function needs to be called within a stateRef context.
   */
  function cancel() {
    testObject.canceled = true;
    removePending(this);
    removeTestFromState(this);
  }
}

export default VestTest;
