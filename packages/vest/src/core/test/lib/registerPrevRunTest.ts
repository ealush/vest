import isPromise from 'isPromise';

import VestTest from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import registerTest from 'registerTest';
import runAsyncTest from 'runAsyncTest';
import { useSetNextCursorAt } from 'stateHooks';
import { useTestAtCursor, useSetTestAtCursor } from 'useTestAtCursor';

export default function registerPrevRunTest(testObject: VestTest): VestTest {
  const prevRunTest = useTestAtCursor(testObject);
  if (isExcluded(testObject)) {
    testObject.skip();
    useSetNextCursorAt();
    return prevRunTest;
  }

  cancelOverriddenPendingTest(prevRunTest, testObject);

  useSetTestAtCursor(testObject);
  useSetNextCursorAt();

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
