import callEach from 'callEach';
import isPromise from 'isPromise';
import isStringValue from 'isStringValue';

import VestTest from 'VestTest';
import ctx from 'ctx';
import hasRemainingTests from 'hasRemainingTests';
import { removePending } from 'pending';
import {
  useTestCallbacks,
  useRefreshTestObjects,
  useStateRef,
} from 'stateHooks';

/**
 * Runs async test.
 */
export default function runAsyncTest(testObject: VestTest): void {
  const { asyncTest, message } = testObject;

  if (!isPromise(asyncTest)) return;

  const stateRef = useStateRef();
  const done = ctx.bind({ stateRef }, () => {
    removePending(testObject);

    // This is for cases in which the suite state was already reset
    if (testObject.canceled) {
      return;
    }

    // Perform required done callback calls and cleanups after the test is finished
    runFieldCallbacks(testObject.fieldName);
    runDoneCallbacks();
  });
  const fail = ctx.bind({ stateRef }, (rejectionMessage?: string) => {
    testObject.message = isStringValue(rejectionMessage)
      ? rejectionMessage
      : message;
    testObject.fail();

    // invalidating the "produce" cache
    useRefreshTestObjects();
    done();
  });
  try {
    asyncTest.then(done, fail);
  } catch (e) {
    fail();
  }
}

/**
 * Runs done callback per field when async tests are finished running.
 */
function runFieldCallbacks(fieldName?: string): void {
  const [{ fieldCallbacks }] = useTestCallbacks();

  if (fieldName) {
    if (
      !hasRemainingTests(fieldName) &&
      Array.isArray(fieldCallbacks[fieldName])
    ) {
      callEach(fieldCallbacks[fieldName]);
    }
  }
}

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
function runDoneCallbacks() {
  const [{ doneCallbacks }] = useTestCallbacks();
  if (!hasRemainingTests()) {
    callEach(doneCallbacks);
  }
}
