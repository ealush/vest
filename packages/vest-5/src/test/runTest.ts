import { VestTest } from 'VestTest';
import { isPromise, isStringValue } from 'vest-utils';

import { SuiteContext, useVestBus } from 'SuiteContext';
import { TestResult } from 'TestTypes';
import { Events } from 'VestBus';
import { verifyTestRun } from 'verifyTestRun';

export function attemptRunTestObjectByTier(testObject: VestTest) {
  verifyTestRun(testObject);

  if (testObject.isNonActionable()) {
    // TODO: Need to test that this works as expected
    return;
  }

  if (testObject.isUntested()) {
    runTest(testObject);
  } else if (isPromise(testObject.asyncTest)) {
    testObject.setPending();
    runAsyncTest(testObject);
  }
}

function runSyncTest(testObject: VestTest): TestResult {
  return SuiteContext.run({ currentTest: testObject }, () => testObject.run());
}

/**
 * runs test, if async - adds to pending array
 */
function runTest(testObject: VestTest): void {
  const VestBus = useVestBus();

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = runSyncTest(testObject);
  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isPromise(result)) {
      testObject.asyncTest = result;
      testObject.setPending();
      runAsyncTest(testObject);
    } else {
      VestBus.emit(Events.TEST_COMPLETED, testObject);
    }
  } catch (e) {
    throw new Error(
      `Unexpected error encountered during test registration.
      Test Object: ${JSON.stringify(testObject)}.
      Error: ${e}.`
    );
  }
}

/**
 * Runs async test.
 */
function runAsyncTest(testObject: VestTest): void {
  const { asyncTest, message } = testObject;

  if (!isPromise(asyncTest)) return;

  const VestBus = useVestBus();

  const done = SuiteContext.bind({ ...SuiteContext.useX() }, () => {
    // invalidating the "produce" cache
    // useRefreshTestObjects();
    VestBus.emit(Events.TEST_COMPLETED, testObject);
  });
  const fail = SuiteContext.bind(
    { ...SuiteContext.useX() },
    (rejectionMessage?: string) => {
      if (testObject.isCanceled()) {
        return;
      }

      testObject.message = isStringValue(rejectionMessage)
        ? rejectionMessage
        : message;
      testObject.fail();

      done();
    }
  );

  asyncTest.then(done, fail);
}
