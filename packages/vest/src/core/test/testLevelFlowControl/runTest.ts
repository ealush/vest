import {
  isPromise,
  isStringValue,
  text,
  deferThrow,
  makeResult,
  Result,
} from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { ErrorStrings } from '../../../errors/ErrorStrings';
import { SuiteContext } from '../../context/SuiteContext';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../isolate/IsolateTest/VestTest';
import { TestResult } from '../TestTypes';
import { shouldUseErrorAsMessage } from '../helpers/shouldUseErrorMessage';

import { useVerifyTestRun } from './verifyTestRun';

export function useAttemptRunTest(testObject: TIsolateTest) {
  useVerifyTestRun(testObject);

  if (VestTest.isUntested(testObject)) {
    return useRunTest(testObject).unwrap();
  }

  if (!VestTest.isNonActionable(testObject)) {
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

function runSyncTest(testObject: TIsolateTest): Result<TestResult> {
  return makeResult.Ok(
    SuiteContext.run({ currentTest: testObject }, () => {
      let result: TestResult;

      const { message, testFn } = VestTest.getData(testObject);

      try {
        result = testFn({ signal: testObject.abortController.signal });
      } catch (error) {
        if (shouldUseErrorAsMessage(message, error).unwrap()) {
          VestTest.getData(testObject).message = error as string;
        }
        result = false;
      }

      if (result === false) {
        VestTest.fail(testObject);
      }

      return result;
    }),
  );
}

/**
 * runs test, if async - adds to pending array
 */
function useRunTest(
  testObject: TIsolateTest,
): Result<Promise<void> | undefined> {
  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = runSyncTest(testObject).unwrap();
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
 * Runs async test.
 */
function useRunAsyncTest(
  testObject: TIsolateTest,
): Result<Promise<void> | undefined> {
  const { asyncTest, message } = VestTest.getData(testObject);

  if (!isPromise(asyncTest)) return makeResult.Ok(undefined);
  // VestTest.setPending(testObject);

  const done = VestRuntime.persist(() => {
    onTestCompleted(testObject).unwrap();
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

  return makeResult.Ok(asyncTest.then(done, fail));
}

function onTestCompleted(testObject: TIsolateTest): Result<void> {
  // Attempts passing if the test is not already failed.
  // or is not canceled/omitted.
  VestTest.pass(testObject);
  return makeResult.Ok(undefined);
}
