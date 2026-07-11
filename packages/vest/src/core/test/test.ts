import { IsolateKey } from 'vestjs-runtime';
import { useEmit } from '../VestBus/VestBus';

import { IsolateTest, TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

import { TestFn, TestMessage } from './TestTypes';
import { useAttemptRunTest } from './testLevelFlowControl/runTest';
import { validateTestParams } from './validateTestParams';

function vestTest(
  fieldName: string,
  message: TestMessage,
  cb: TestFn,
): TIsolateTest;
function vestTest(fieldName: string, cb: TestFn): TIsolateTest;
function vestTest(
  fieldName: string,
  message: TestMessage,
  cb: TestFn,
  key: IsolateKey,
): TIsolateTest;
function vestTest(fieldName: string, cb: TestFn, key: IsolateKey): TIsolateTest;
// eslint-disable-next-line vest-internal/use-use
function vestTest(
  fieldName: string,
  ...args:
    | [message: TestMessage, cb: TestFn]
    | [cb: TestFn]
    | [message: TestMessage, cb: TestFn, key: IsolateKey]
    | [cb: TestFn, key: IsolateKey]
): TIsolateTest {
  const {
    fieldName: safeFieldName,
    issue,
    message,
    testFn,
    key,
  } = validateTestParams(fieldName, ...args).unwrap();

  const testObjectInput = { fieldName: safeFieldName, issue, message, testFn };

  // This invalidates the suite cache.
  useEmit('TEST_RUN_STARTED');

  return IsolateTest(useAttemptRunTest, testObjectInput, key);
}

export const test = vestTest;
