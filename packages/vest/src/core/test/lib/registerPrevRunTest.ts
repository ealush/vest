import isPromise from 'isPromise';

// TODO:
/**
 *
 * Key flow:
 * When no prev-runs exist, we're only "recordings" the test state.
 *
 * When prev-runs exist, we're refilling the test state with the prev-run state.
 *
 * When expecting a test with a certain key, but a different key (or not key) test is encountered:
 *  Search in the prev test run if the encountered key was present in the previous run state. If so, rehydrate. Keep aside the newly misplaced test state.
 *  If not found throughout the run, discard of that found key test.
 */

import VestTest from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded, isExcludedIndividually } from 'exclusive';
import registerTest from 'registerTest';
import runAsyncTest from 'runAsyncTest';
import * as testCursor from 'testCursor';
import { useTestAtCursor, useSetTestAtCursor } from 'useTestAtCursor';

export default function registerPrevRunTest(testObject: VestTest): VestTest {
  const prevRunTest = useTestAtCursor(testObject);

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
