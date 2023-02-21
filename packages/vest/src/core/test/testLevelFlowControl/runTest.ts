import { isPromise, isStringValue } from 'vest-utils';

import { BusType } from '../../../../../vest-utils/src/bus';

import { IsolateTest } from 'IsolateTest';
import { persist, useVestBus } from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { TestResult } from 'TestTypes';
import { Events } from 'VestBus';
import { verifyTestRun } from 'verifyTestRun';

export function attemptRunTestObjectByTier(testObject: IsolateTest) {
  verifyTestRun(testObject);

  if (testObject.isNonActionable()) {
    // TODO: Need to test that this works as expected
    return;
  }

  if (testObject.isUntested()) {
    runTest(testObject);
  } else if (testObject.isAsyncTest()) {
    testObject.setPending();
    runAsyncTest(testObject);
  }
}

function runSyncTest(testObject: IsolateTest): TestResult {
  return SuiteContext.run({ currentTest: testObject }, () => testObject.run());
}

/**
 * runs test, if async - adds to pending array
 */
function runTest(testObject: IsolateTest): void {
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
      onTestCompleted(VestBus, testObject);
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
function runAsyncTest(testObject: IsolateTest): void {
  const { asyncTest, message } = testObject;

  if (!isPromise(asyncTest)) return;

  const VestBus = useVestBus();

  const done = persist(() => {
    onTestCompleted(VestBus, testObject);
  });
  const fail = persist((rejectionMessage?: string) => {
    if (testObject.isCanceled()) {
      return;
    }

    testObject.message = isStringValue(rejectionMessage)
      ? rejectionMessage
      : message;
    testObject.fail();

    done();
  });

  asyncTest.then(done, fail);
}

function onTestCompleted(VestBus: BusType, testObject: IsolateTest) {
  // Attempts passing if the test is not already failed.
  // or is not canceled/omitted.
  testObject.pass();

  VestBus.emit(Events.TEST_COMPLETED, testObject);
}
