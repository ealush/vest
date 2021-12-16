import isPromise from 'isPromise';

import VestTest from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded, isExcludedIndividually } from 'exclusive';
import { isOmitted } from 'omitWhen';
import registerTest from 'registerTest';
import runAsyncTest from 'runAsyncTest';
import * as testCursor from 'testCursor';
import { useTestAtCursor, useSetTestAtCursor } from 'useTestAtCursor';

// eslint-disable-next-line max-statements
export default function registerPrevRunTest(testObject: VestTest): VestTest {
  const prevRunTest = useTestAtCursor(testObject);

  if (isOmitted()) {
    prevRunTest.omit();
    testCursor.moveForward();
    return prevRunTest;
  }

  if (isExcluded(testObject)) {
    // We're forcing skipping the pending test
    // if we're directly within a skipWhen block
    // This mostly means that we're probably giving
    // up on this async test intentionally.
    prevRunTest.skip(isExcludedIndividually());
    testCursor.moveForward();
    return prevRunTest;
  }
  cancelOverriddenPendingTest(prevRunTest, testObject);

  useSetTestAtCursor(testObject);
  testCursor.moveForward();

  registerTestObjectByTier(testObject);

  return testObject;
}

function registerTestObjectByTier(testObject: VestTest) {
  if (testObject.isUntested()) {
    registerTest(testObject);
  } else if (isPromise(testObject.asyncTest)) {
    testObject.setPending();
    runAsyncTest(testObject);
  }
}
