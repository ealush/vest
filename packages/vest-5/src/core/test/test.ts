import { VestTest } from 'VestTest';
import { testObjectIsolate } from 'testObjectIsolate';
import { assign, isFunction } from 'vest-utils';

import { wrapTestMemo } from './test.memo';

import { useGroupName } from 'SuiteContext';
import { TestFn } from 'TestTypes';

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
