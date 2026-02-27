/**
 * Module: `src/core/test/testLevelFlowControl/runTest.ts`.
 *
 * Provides `runTest`-related runtime and type utilities used by `vest`.
 */
import {
  isPromise,
  isStringValue,
  text,
  deferThrow,
  makeResult,
  Result,
  isUndefined,
} from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { ErrorStrings } from '../../../errors/ErrorStrings';
import { SuiteContext } from '../../context/SuiteContext';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../isolate/IsolateTest/VestTest';
import { TestResult } from '../TestTypes';
import { shouldUseErrorAsMessage } from '../helpers/shouldUseErrorMessage';
import { getAbortController } from '../Abortable';

import { useVerifyTestRun } from './verifyTestRun';

/**
 * Attempts to run a test.
 * This function verifies if the test should run, and if so, runs it.
 * @param testObject - The test isolate to run.
 */
export function useAttemptRunTest(testObject: TIsolateTest) {
  useVerifyTestRun(testObject);

  if (VestTest.isUntested(testObject).unwrap()) {
    return useRunTest(testObject).unwrap();
  }

  if (!VestTest.isNonActionable(testObject).unwrap()) {
    // Probably unreachable. If we get here, it means that
    // something was really wrong and should be reported.
    /* istanbul ignore next */
    deferThrow(
      text(ErrorStrings.UNEXPECTED_TEST_REGISTRATION_ERROR, {
        testObject: JSON.stringify(testObject),
      }),
    );
  }
}

/**
 * Runs a synchronous test.
 * @param testObject - The test isolate to run.
 * @returns The result of the test run.
 */
function useRunSyncTest(testObject: TIsolateTest): Result<TestResult> {
  return makeResult.Ok(
    SuiteContext.run({ currentTest: testObject }, () => {
      const result = runTestCallback(testObject);

      if (result === false) {
        VestTest.fail(testObject);
      }

      return result;
    }),
  );
}

function runTestCallback(testObject: TIsolateTest): TestResult {
  const { message, testFn } = VestTest.getData(testObject);

  try {
    return testFn({ signal: getAbortController(testObject).signal });
  } catch (error) {
    if (shouldUseErrorAsMessage(message, error).unwrap()) {
      VestTest.getData(testObject).message = error as string;
    }
    return false;
  }
}

/**
 * Runs a test, handling both synchronous and asynchronous tests.
 * If the test returns a promise, it is marked as async and added to the pending list.
 * @param testObject - The test isolate to run.
 * @returns A promise if the test is async, or undefined if it's sync.
 */
function useRunTest(
  testObject: TIsolateTest,
): Result<Promise<void> | undefined> {
  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = useRunSyncTest(testObject).unwrap();
  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isPromise(result)) {
      VestTest.getData(testObject).asyncTest = result;
      return useRunAsyncTest(testObject);
    }

    onTestCompleted(testObject).unwrap();
    return makeResult.Ok(undefined);
  } catch (e) {
    // Probably unreachable. If we get here, it means that
    // something was really wrong and should be reported.
    /* istanbul ignore next */
    throw new Error(
      text(ErrorStrings.UNEXPECTED_TEST_REGISTRATION_ERROR, {
        testObject: JSON.stringify(testObject),
        error: e,
      }),
    );
  }
}

/**
 * Runs an asynchronous test.
 * Sets up the success and failure callbacks for the promise.
 * @param testObject - The test isolate to run.
 * @returns The promise of the async test.
 */
function useRunAsyncTest(
  testObject: TIsolateTest,
): Result<Promise<void> | undefined> {
  const { asyncTest, message } = VestTest.getData(testObject);

  if (!isPromise(asyncTest)) return makeResult.Ok(undefined);
  VestTest.setStarted(testObject);

  const done = VestRuntime.persist(() => {
    onTestCompleted(testObject).unwrap();
  });
  const fail = VestRuntime.persist((rejectionMessage?: unknown) => {
    if (VestTest.isCanceled(testObject).unwrap()) {
      return;
    }

    const errorMessage = isStringValue(rejectionMessage)
      ? rejectionMessage
      : rejectionMessage instanceof Error
        ? rejectionMessage.message
        : undefined;

    VestTest.getData(testObject).message = isUndefined(message)
      ? errorMessage
      : message;
    VestTest.fail(testObject);

    done();
  });

  return makeResult.Ok(asyncTest.then(done, fail));
}

function onTestCompleted(testObject: TIsolateTest): Result<void> {
  // Attempts passing if the test is not already failed.
  // or is not canceled/omitted.
  VestTest.pass(testObject);
  return makeResult.Ok(undefined);
}
