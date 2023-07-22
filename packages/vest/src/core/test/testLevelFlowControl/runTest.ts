import {
  isPromise,
  isStringValue,
  BusType,
  text,
  deferThrow,
} from 'vest-utils';
import { Bus, IsolateInspector, VestRuntime } from 'vestjs-runtime';

import { Events } from 'BusEvents';
import { ErrorStrings } from 'ErrorStrings';
import { TIsolateTest } from 'IsolateTest';
import { SuiteContext } from 'SuiteContext';
import { TestResult } from 'TestTypes';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';
import { shouldUseErrorAsMessage } from 'shouldUseErrorMessage';
import { useVerifyTestRun } from 'verifyTestRun';

// eslint-disable-next-line max-statements
export function useAttemptRunTest(testObject: TIsolateTest) {
  useVerifyTestRun(testObject);

  if (VestTestInspector.isUntested(testObject)) {
    return useRunTest(testObject);
  }

  if (!VestTestInspector.isNonActionable(testObject)) {
    // Probably unreachable. If we get here, it means that
    // something was really wrong and should be reported.
    /* istanbul ignore next */
    deferThrow(
      text(ErrorStrings.UNEXPECTED_TEST_REGISTRATION_ERROR, {
        testObject: IsolateInspector.dump(testObject),
      })
    );
  }
}

function runSyncTest(testObject: TIsolateTest): TestResult {
  return SuiteContext.run({ currentTest: testObject }, () => {
    let result: TestResult;

    const { message, testFn } = VestTestInspector.getData(testObject);

    try {
      result = testFn();
    } catch (error) {
      if (shouldUseErrorAsMessage(message, error)) {
        testObject.data.message = error;
      }
      result = false;
    }

    if (result === false) {
      VestTestMutator.fail(testObject);
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
      testObject.data.asyncTest = result;
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
  const { asyncTest, message } = VestTestInspector.getData(testObject);

  if (!isPromise(asyncTest)) return;
  VestTestMutator.setPending(testObject);

  const VestBus = Bus.useBus();

  const done = VestRuntime.persist(() => {
    onTestCompleted(VestBus, testObject);
  });
  const fail = VestRuntime.persist((rejectionMessage?: string) => {
    if (VestTestInspector.isCanceled(testObject)) {
      return;
    }

    testObject.data.message = isStringValue(rejectionMessage)
      ? rejectionMessage
      : message;
    VestTestMutator.fail(testObject);

    done();
  });

  asyncTest.then(done, fail);
}

function onTestCompleted(VestBus: BusType, testObject: TIsolateTest) {
  // Attempts passing if the test is not already failed.
  // or is not canceled/omitted.
  VestTestMutator.pass(testObject);

  VestBus.emit(Events.TEST_COMPLETED, testObject);
}
