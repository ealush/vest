import isPromise from 'isPromise';

import VestTest from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { useCursor } from 'isolate';
import { shouldSkipBasedOnMode } from 'mode';
import { isOmitted } from 'omitWhen';
import registerTest from 'registerTest';
import runAsyncTest from 'runAsyncTest';
import { isExcludedIndividually } from 'skipWhen';
import { useTestAtCursor, useSetTestAtCursor } from 'useTestAtCursor';

// eslint-disable-next-line max-statements
export default function registerPrevRunTest(testObject: VestTest): VestTest {
  const cursor = useCursor();

  if (shouldSkipBasedOnMode(testObject)) {
    testObject.skip();
    useTestAtCursor(testObject);

    cursor.next();
    return testObject;
  }

  const prevRunTest = useTestAtCursor(testObject);

  if (isOmitted()) {
    prevRunTest.omit();
    cursor.next();
    return prevRunTest;
  }

  if (isExcluded(testObject)) {
    // We're forcing skipping the pending test
    // if we're directly within a skipWhen block
    // This mostly means that we're probably giving
    // up on this async test intentionally.
    prevRunTest.skip(isExcludedIndividually());
    cursor.next();
    return prevRunTest;
  }
  cancelOverriddenPendingTest(prevRunTest, testObject);

  useSetTestAtCursor(testObject);

  registerTestObjectByTier(testObject);

  cursor.next();
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
