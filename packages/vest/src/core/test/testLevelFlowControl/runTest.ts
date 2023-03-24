import { isPromise, isStringValue, BusType, text } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { IsolateTest } from 'IsolateTest';
import { persist, useVestBus } from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { TestResult } from 'TestTypes';
import { Events } from 'VestBus';
import { useVerifyTestRun } from 'verifyTestRun';

export function useAttemptRunTestObjectByTier(testObject: IsolateTest) {
  useVerifyTestRun(testObject);

  if (testObject.isNonActionable()) {
    // TODO: Need to test that this works as expected
    return;
  }

  if (testObject.isUntested()) {
    useRunTest(testObject);
  } else if (testObject.isAsyncTest()) {
    testObject.setPending();
    useRunAsyncTest(testObject);
  }
}

function runSyncTest(testObject: IsolateTest): TestResult {
  return SuiteContext.run({ currentTest: testObject }, () => testObject.run());
}

/**
 * runs test, if async - adds to pending array
 */
function useRunTest(testObject: IsolateTest): void {
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
      useRunAsyncTest(testObject);
    } else {
      onTestCompleted(VestBus, testObject);
    }
  } catch (e) {
    throw new Error(
      text(ErrorStrings.UNEXPECTED_TEST_REGISTRATION_ERROR, {
        testObject: JSON.stringify(testObject),
        error: e,
      })
    );
  }
}

/**
 * Runs async test.
 */
function useRunAsyncTest(testObject: IsolateTest): void {
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
