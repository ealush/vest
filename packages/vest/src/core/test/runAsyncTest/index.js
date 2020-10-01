import context from '../../context';
import hasRemainingTests from '../../suite/hasRemainingTests';
import { removePending } from '../lib/pending';

/**
 * Runs async test.
 * @param {VestTest} testObject A VestTest instance.
 */
const runAsyncTest = testObject => {
  const { asyncTest, statement, id } = testObject;
  const { stateRef } = context.use();
  const done = cb => {
    const isCanceled = stateRef.getCanceled()[id];

    if (isCanceled) {
      stateRef.removeCanceled(testObject);
    }

    // This is for cases in which the suite state was already reset
    if (!stateRef.current()) {
      return;
    }

    // This allows us to reference the state in async context as well
    context.run({ stateRef }, () => {
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

      // Perform required done callback calls and cleanups after the test is finished
      onAsyncTestFinished(testObject);
    });
  };
  const fail = rejectionMessage => {
    done(() => {
      testObject.statement =
        typeof rejectionMessage === 'string' ? rejectionMessage : statement;
      testObject.fail();
    });
  };
  context.run({ currentTest: testObject }, () => {
    try {
      asyncTest.then(done, fail);
    } catch (e) {
      fail();
    }
  });
};

/**
 * Runs done callback when async tests are finished running.
 * @param {string} [fieldName] Field name with associated callbacks.
 */
const runDoneCallbacks = (stateRef, fieldName) => {
  const currentState = stateRef.current();
  if (fieldName) {
    if (
      !hasRemainingTests(currentState, fieldName) &&
      Array.isArray(currentState.fieldCallbacks[fieldName])
    ) {
      currentState.fieldCallbacks[fieldName].forEach(cb => cb());
    }
  }
  if (!hasRemainingTests(currentState)) {
    currentState.doneCallbacks.forEach(cb => cb());
  }
};

/**
 * Perform completion actions and cleanups after an async test
 * @param {VestTest} testObject   A VestTest instance
 * @param {string} operationMode  Operation mode retrieved from context
 */
const onAsyncTestFinished = testObject => {
  const { stateRef } = context.use();
  const { fieldName } = testObject;

  runDoneCallbacks(stateRef, fieldName);
};

export default runAsyncTest;
