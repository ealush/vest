import { OPERATION_MODE_STATELESS } from '../../../constants';
import runWithContext from '../../../lib/runWithContext';
import singleton from '../../../lib/singleton';
import { getStateKey, getSuites } from '../../state';
import cleanupCompletedSuite from '../../state/cleanupCompletedSuite';
import { KEY_CANCELED } from '../../state/constants';
import getSuiteState from '../../state/getSuiteState';
import hasRemainingTests from '../../state/hasRemainingTests';
import { removeCanceled } from '../lib/canceled';
import { removePending } from '../lib/pending';
import { VestTestType } from '../lib/VestTest';
/**
 * Runs done callback when async tests are finished running.
 */
const runDoneCallbacks = (suiteId: string, fieldName?: string) => {
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
 */
const runAsyncTest = (testObject: VestTestType) => {
  const { asyncTest, statement, fieldName, id, suiteId } = testObject;
  const { operationMode } = singleton.useContext();
  const done = (cb?: () => void) => {
    const isCanceled = getStateKey(KEY_CANCELED)[id];

    if (isCanceled) {
      removeCanceled(testObject);
    }

    // This is for cases in which the suite state was already reset
    if (!getSuites()[suiteId]) {
      return;
    }

    removePending(testObject);

    // We're returning here and not in the first `isCanceled` check
    // because we need to remove pending regardless - as long as the\
    // suite is present.
    if (isCanceled) {
      return;
    }

    // ❗️This callback is the `fail` function (see below)
    // it must run before running the done callbacks
    // so the field is marked as failed
    // before being passed to the `done` callback
    if (typeof cb === 'function') {
      cb();
    }

    runDoneCallbacks(suiteId, fieldName);

    if (operationMode === OPERATION_MODE_STATELESS) {
      cleanupCompletedSuite(suiteId);
    }
  };
  const fail = (rejectionMessage?: string) => {
    done(() => {
      testObject.statement =
        typeof rejectionMessage === 'string' ? rejectionMessage : statement;
      testObject.fail();
    });
  };
  runWithContext({ currentTest: testObject }, () => {
    try {
      asyncTest.then(done, fail);
    } catch (e) {
      fail();
    }
  });
};

export default runAsyncTest;
