import isPromise from 'isPromise';

import VestTest from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { moveCursorAtForward } from 'cursorAt';
import { isExcluded } from 'exclusive';
import registerTest from 'registerTest';
import runAsyncTest from 'runAsyncTest';
import { useTestAtCursor, useSetTestAtCursor } from 'useTestAtCursor';

export default function registerPrevRunTest(testObject: VestTest): VestTest {
  const prevRunTest = useTestAtCursor(testObject);
  if (isExcluded(testObject)) {
    testObject.skip();
    moveCursorAtForward();
    return prevRunTest;
  }

  cancelOverriddenPendingTest(prevRunTest, testObject);

  useSetTestAtCursor(testObject);
  moveCursorAtForward();

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
