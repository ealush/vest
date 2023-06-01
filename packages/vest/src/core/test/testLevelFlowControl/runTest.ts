import {
  isPromise,
  isStringValue,
  BusType,
  text,
  deferThrow,
} from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { Events } from 'BusEvents';
import { ErrorStrings } from 'ErrorStrings';
import { IsolateTest } from 'IsolateTest';
import { SuiteContext } from 'SuiteContext';
import { TestResult } from 'TestTypes';
import { useVerifyTestRun } from 'verifyTestRun';

// eslint-disable-next-line max-statements
export function useAttemptRunTest(testObject: IsolateTest) {
  useVerifyTestRun(testObject);

  if (testObject.isUntested()) {
    return useRunTest(testObject);
  }

  if (!testObject.isNonActionable()) {
    // Probably unreachable. If we get here, it means that
    // something was really wrong and should be reported.
    /* istanbul ignore next */
    deferThrow(
      text(ErrorStrings.UNEXPECTED_TEST_REGISTRATION_ERROR, {
        testObject: JSON.stringify(testObject),
      })
    );
  }
}

function runSyncTest(testObject: IsolateTest): TestResult {
  return SuiteContext.run({ currentTest: testObject }, () => testObject.run());
}

/**
 * runs test, if async - adds to pending array
 */
function useRunTest(testObject: IsolateTest): void {
  const VestBus = VestRuntime.useBus();

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = runSyncTest(testObject);
  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isPromise(result)) {
      testObject.asyncTest = result;
      useRunAsyncTest(testObject);
    } else {
      onTestCompleted(VestBus, testObject);
    }
  } catch (e) {
    // Probably unreachable. If we get here, it means that
    // something was really wrong and should be reported.
    /* istanbul ignore next */
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
  testObject.setPending();

  const VestBus = VestRuntime.useBus();

  const done = VestRuntime.persist(() => {
    onTestCompleted(VestBus, testObject);
  });
  const fail = VestRuntime.persist((rejectionMessage?: string) => {
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
