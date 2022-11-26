import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { isolate } from 'isolate';
import { isFunction } from 'vest-utils';

import { useGroupName, useSetIsolateKey } from 'SuiteContext';
import { TestFn } from 'TestTypes';
import { attemptRunTestObjectByTier } from 'runTest';

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

  useSetIsolateKey(key, testObject);

  isolate(
    IsolateTypes.TEST,
    () => {
      attemptRunTestObjectByTier(testObject);
    },
    testObject
  );

  return testObject;
}

export { vestTest as test };
