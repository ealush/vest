import { OPERATION_MODE_STATELESS } from '../../../constants';
import singleton from '../../../lib/singleton';
import { getState } from '../../state';
import cleanupCompletedSuite from '../../state/cleanupCompletedSuite';
import getSuiteState from '../../state/getSuiteState';
import hasRemainingTests from '../../state/hasRemainingTests';
import { SYMBOL_CANCELED } from '../../state/symbols';
import { removePending } from '../lib/pending';
import runTest from '../lib/runTest';

/**
 * Runs done callback when async tests are finished running.
 * @param {String} suiteId
 * @param {string} [fieldName] Field name with associated callbacks.
 */
const runDoneCallbacks = (suiteId, fieldName) => {
  const state = getSuiteState(suiteId);
  if (fieldName) {
    if (
      !hasRemainingTests(state, fieldName) &&
      Array.isArray(state.fieldCallbacks[fieldName])
    ) {
      state.fieldCallbacks[fieldName].forEach(cb => cb());
    }
  }
  if (!hasRemainingTests(state)) {
    state.doneCallbacks.forEach(cb => cb());
  }
};

/**
 * Runs async test.
 * @param {VestTest} testObject A VestTest instance.
 */
const runAsyncTest = testObject => {
  const { testFn, statement, fieldName, id, suiteId } = testObject;
  const { operationMode } = singleton.useContext();
  const done = cb => {
    // If current test instance is canceled

    if (getState(SYMBOL_CANCELED)[id]) {
      return;
    }

    // ❗️This callback is the `fail` function (see below)
    // it must run before running the done callbacks
    // so the field is marked as failed
    // before being passed to the `done` callback
    if (typeof cb === 'function') {
      cb();
    }

    removePending(testObject);
    runDoneCallbacks(suiteId, fieldName);

    if (operationMode === OPERATION_MODE_STATELESS) {
      cleanupCompletedSuite(suiteId);
    }
  };
  const fail = rejectionMessage => {
    done(() => {
      testObject.statement =
        typeof rejectionMessage === 'string' ? rejectionMessage : statement;
      testObject.fail();
    });
  };
  runTest(testObject, () => {
    try {
      testFn.then(done, fail);
    } catch (e) {
      fail();
    }
  });
};

export default runAsyncTest;
