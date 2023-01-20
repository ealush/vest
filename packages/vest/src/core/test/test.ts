import { assign, invariant, isFunction, isStringValue } from 'vest-utils';

import { wrapTestMemo } from './test.memo';

import { useEmit } from 'PersistedContext';
import { useGroupName } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { Events } from 'VestBus';
import { VestTest } from 'VestTest';
import { testObjectIsolate } from 'testObjectIsolate';

function vestTest<F extends TFieldName>(
  fieldName: F,
  message: string,
  cb: TestFn
): VestTest;
function vestTest<F extends TFieldName>(fieldName: F, cb: TestFn): VestTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
  message: string,
  cb: TestFn,
  key: string
): VestTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
  cb: TestFn,
  key: string
): VestTest;
function vestTest<F extends TFieldName>(
  fieldName: F,
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
  const emit = useEmit();

  const testObject = new VestTest(fieldName, testFn, {
    message,
    groupName,
    key,
  });

  // This invalidates the suite cache.
  emit(Events.TEST_RUN_STARTED);

  return testObjectIsolate(testObject);
}

export const test = assign(vestTest, {
  memo: wrapTestMemo(vestTest),
});

export type VTest = typeof vestTest;

function invalidParamError(name: string, expected: string): string {
  return `Incompatible params passed to test function. Test ${name} must be a ${expected}`;
}
