import { assign, invariant, isFunction, isStringValue, text } from 'vest-utils';
import { Bus, IsolateKey } from 'vestjs-runtime';

import { wrapTestMemo } from './test.memo';
import { useAttemptRunTest } from './testLevelFlowControl/runTest';

import { Events } from '@/core/VestBus/BusEvents';
import { useGroupName } from '@/core/context/SuiteContext';
import {
  IsolateTest,
  TIsolateTest,
} from '@/core/isolate/IsolateTest/IsolateTest';
import { TestFn } from '@/core/test/TestTypes';
import { ErrorStrings } from '@/errors/ErrorStrings';
import { TFieldName } from '@/suiteResult/SuiteResultTypes';

function vestTest<F extends TFieldName>(
  fieldName: F,
  message: string,
  cb: TestFn,
): TIsolateTest;
function vestTest<F extends TFieldName>(fieldName: F, cb: TestFn): TIsolateTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
  message: string,
  cb: TestFn,
  key: IsolateKey,
): TIsolateTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
  cb: TestFn,
  key: IsolateKey,
): TIsolateTest;
// @vx-allow use-use
function vestTest<F extends TFieldName>(
  fieldName: F,
  ...args:
    | [message: string, cb: TestFn]
    | [cb: TestFn]
    | [message: string, cb: TestFn, key: IsolateKey]
    | [cb: TestFn, key: IsolateKey]
): TIsolateTest {
  const [message, testFn, key] = (
    isFunction(args[1]) ? args : [undefined, ...args]
  ) as [string, TestFn, IsolateKey];

  validateTestParams(fieldName, testFn);

  const groupName = useGroupName();

  const testObjectInput = { fieldName, groupName, message, testFn };

  // This invalidates the suite cache.
  Bus.useEmit(Events.TEST_RUN_STARTED);

  return IsolateTest(useAttemptRunTest, testObjectInput, key);
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
    }),
  );
  invariant(
    isFunction(testFn),
    text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
      fn_name: fnName,
      param: 'callback',
      expected: 'function',
    }),
  );
}
