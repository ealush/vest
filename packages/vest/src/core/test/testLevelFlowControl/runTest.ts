import {
  isPromise,
  isStringValue,
  BusType,
  text,
  deferThrow,
} from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { Events } from 'BusEvents';
import { ErrorStrings } from 'ErrorStrings';
import { TIsolateTest } from 'IsolateTest';
import { SuiteContext } from 'SuiteContext';
import { TestResult } from 'TestTypes';
import { VestTest } from 'VestTest';
import { shouldUseErrorAsMessage } from 'shouldUseErrorMessage';
import { useVerifyTestRun } from 'verifyTestRun';

// eslint-disable-next-line max-statements
export function useAttemptRunTest(testObject: TIsolateTest) {
  useVerifyTestRun(testObject);

  if (VestTest.isUntested(testObject)) {
    return useRunTest(testObject);
  }

  if (!VestTest.isNonActionable(testObject)) {
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

function runSyncTest(testObject: TIsolateTest): TestResult {
  return SuiteContext.run({ currentTest: testObject }, () => {
    let result: TestResult;

    const { message, testFn, abortController } = VestTest.getData(testObject);

    try {
      result = testFn(abortController.signal);
    } catch (error) {
      if (shouldUseErrorAsMessage(message, error)) {
        VestTest.getData(testObject).message = error;
      }
      result = false;
    }

    if (result === false) {
      VestTest.fail(testObject);
    }

    return result;
  });
}

/**
 * runs test, if async - adds to pending array
 */
function useRunTest(testObject: TIsolateTest): void {
  const VestBus = Bus.useBus();

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = runSyncTest(testObject);
  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isPromise(result)) {
      VestTest.getData(testObject).asyncTest = result;
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
function useRunAsyncTest(testObject: TIsolateTest): void {
  const { asyncTest, message } = VestTest.getData(testObject);

  if (!isPromise(asyncTest)) return;
  VestTest.setPending(testObject);

  const VestBus = Bus.useBus();

  const done = VestRuntime.persist(() => {
    onTestCompleted(VestBus, testObject);
  });
  const fail = VestRuntime.persist((rejectionMessage?: string) => {
    if (VestTest.isCanceled(testObject)) {
      return;
    }

    VestTest.getData(testObject).message = isStringValue(rejectionMessage)
      ? rejectionMessage
      : message;
    VestTest.fail(testObject);

    done();
  });

  asyncTest.then(done, fail);
}

function onTestCompleted(VestBus: BusType, testObject: TIsolateTest) {
  // Attempts passing if the test is not already failed.
  // or is not canceled/omitted.
  VestTest.pass(testObject);

  VestBus.emit(Events.TEST_COMPLETED, testObject);
}
