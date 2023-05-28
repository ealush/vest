import { IsolateKey, VestRuntime } from 'vest-runtime';
import { assign, invariant, isFunction, isStringValue, text } from 'vest-utils';

import { Events } from 'BusEvents';
import { ErrorStrings } from 'ErrorStrings';
import { IsolateTest } from 'IsolateTest';
import { useGroupName } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { useAttemptRunTest } from 'runTest';
import { wrapTestMemo } from 'test.memo';

function vestTest<F extends TFieldName>(
  fieldName: F,
  message: string,
  cb: TestFn
): IsolateTest;
function vestTest<F extends TFieldName>(fieldName: F, cb: TestFn): IsolateTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
  message: string,
  cb: TestFn,
  key: IsolateKey
): IsolateTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
  cb: TestFn,
  key: IsolateKey
): IsolateTest;
// @vx-allow use-use
function vestTest<F extends TFieldName>(
  fieldName: F,
  ...args:
    | [message: string, cb: TestFn]
    | [cb: TestFn]
    | [message: string, cb: TestFn, key: IsolateKey]
    | [cb: TestFn, key: IsolateKey]
): IsolateTest {
  const [message, testFn, key] = (
    isFunction(args[1]) ? args : [undefined, ...args]
  ) as [string | undefined, TestFn, IsolateKey];

  validateTestParams(fieldName, testFn);

  const groupName = useGroupName();
  const emit = VestRuntime.useEmit();

  const testObjectInput = { fieldName, groupName, key, message, testFn };

  // This invalidates the suite cache.
  emit(Events.TEST_RUN_STARTED);

  return IsolateTest.create(useAttemptRunTest, testObjectInput);
}

export const test = assign(vestTest, {
  memo: wrapTestMemo(vestTest),
});

export type VTest = typeof vestTest;

function validateTestParams(fieldName: string, testFn: TestFn): void {
  const fnName = 'test';
  invariant(
    isStringValue(fieldName),
    text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
      fn_name: fnName,
      param: 'fieldName',
      expected: 'string',
    })
  );
  invariant(
    isFunction(testFn),
    text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
      fn_name: fnName,
      param: 'callback',
      expected: 'function',
    })
  );
}
