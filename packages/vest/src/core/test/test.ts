import { invariant, isFunction, isStringValue, text } from 'vest-utils';
import { Bus, IsolateKey } from 'vestjs-runtime';

import { ErrorStrings } from '../../errors/ErrorStrings';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';
import { IsolateTest, TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

import { TestFn } from './TestTypes';
import { useAttemptRunTest } from './testLevelFlowControl/runTest';

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

  const testObjectInput = { fieldName, message, testFn };

  // This invalidates the suite cache.
  Bus.useEmit('TEST_RUN_STARTED');

  return IsolateTest(useAttemptRunTest, testObjectInput, key);
}

export const test = vestTest;

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
