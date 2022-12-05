import { assign, invariant, isFunction, isStringValue } from 'vest-utils';

import { wrapTestMemo } from './test.memo';

import { useGroupName } from 'SuiteContext';
import { TestFn } from 'TestTypes';
import { VestTest } from 'VestTest';
import { testObjectIsolate } from 'testObjectIsolate';

function vestTest(fieldName: string, message: string, cb: TestFn): VestTest;
function vestTest(fieldName: string, cb: TestFn): VestTest;
function vestTest(
  fieldName: string,
  message: string,
  cb: TestFn,
  key: string
): VestTest;
function vestTest(fieldName: string, cb: TestFn, key: string): VestTest;
function vestTest(
  fieldName: string,
  ...args:
    | [message: string, cb: TestFn]
    | [cb: TestFn]
    | [message: string, cb: TestFn, key: string]
    | [cb: TestFn, key: string]
): VestTest {
  const [message, testFn, key] = (
    isFunction(args[1]) ? args : [undefined, ...args]
  ) as [string | undefined, TestFn, string | undefined];

  invariant(isStringValue(fieldName), invalidParamError('fieldName', 'string'));
  invariant(isFunction(testFn), invalidParamError('callback', 'function'));

  const groupName = useGroupName();

  const testObject = new VestTest(fieldName, testFn, {
    message,
    groupName,
    key,
  });

  return testObjectIsolate(testObject);
}

export const test = assign(vestTest, {
  memo: wrapTestMemo(vestTest),
});

export type VTest = typeof vestTest;

function invalidParamError(name: string, expected: string): string {
  return `Incompatible params passed to test function. Test ${name} must be a ${expected}`;
}
