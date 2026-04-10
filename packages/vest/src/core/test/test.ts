import { IsolateKey } from 'vestjs-runtime';

import { IsolateTest } from '../isolate/IsolateTest/IsolateTest';
import { useEmit } from '../VestBus/VestBus';

import { TestReturnValue } from './TestReturnValue';
import { TestFn, TestMessage } from './TestTypes';
import { useAttemptRunTest } from './testLevelFlowControl/runTest';
import { validateTestParams } from './validateTestParams';
import { useRegisterDependencies } from './dependsOn';

function vestTest(
  fieldName: string,
  message: TestMessage,
  cb: TestFn,
): TestReturnValue;
function vestTest(fieldName: string, cb: TestFn): TestReturnValue;
function vestTest(
  fieldName: string,
  message: TestMessage,
  cb: TestFn,
  key: IsolateKey,
): TestReturnValue;
function vestTest(
  fieldName: string,
  cb: TestFn,
  key: IsolateKey,
): TestReturnValue;
// eslint-disable-next-line vest-internal/use-use
function vestTest(
  fieldName: string,
  ...args:
    | [message: TestMessage, cb: TestFn]
    | [cb: TestFn]
    | [message: TestMessage, cb: TestFn, key: IsolateKey]
    | [cb: TestFn, key: IsolateKey]
): TestReturnValue {
  const {
    fieldName: safeFieldName,
    message,
    testFn,
    key,
  } = validateTestParams(fieldName, ...args).unwrap();

  const testObjectInput = { fieldName: safeFieldName, message, testFn };

  // This invalidates the suite cache.
  useEmit('TEST_RUN_STARTED');

  const isolate = IsolateTest(useAttemptRunTest, testObjectInput, key);


  const returnValue = Object.assign(isolate, {
    dependsOn(...fields: string[]) {
      useRegisterDependencies(safeFieldName, fields, isolate);
      return returnValue;
    },
  }) as TestReturnValue;

  return returnValue;
}

export const test = vestTest;
