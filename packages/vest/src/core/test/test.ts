import { assign, invariant, isFunction, isStringValue } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { useEmit } from 'PersistedContext';
import { useGroupName } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { Events } from 'VestBus';
import { IsolateKey } from 'isolate';
import { useAttemptRunTestObjectByTier } from 'runTest';
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

  invariant(isStringValue(fieldName), invalidParamError('fieldName', 'string'));
  invariant(isFunction(testFn), invalidParamError('callback', 'function'));

  const groupName = useGroupName();
  const emit = useEmit();

  const testObjectInput = { fieldName, groupName, key, message, testFn };

  // This invalidates the suite cache.
  emit(Events.TEST_RUN_STARTED);

  return IsolateTest.create(useAttemptRunTestObjectByTier, testObjectInput);
}

export const test = assign(vestTest, {
  memo: wrapTestMemo(vestTest),
});

export type VTest = typeof vestTest;

function invalidParamError(name: string, expected: string): string {
  return `Incompatible params passed to test function. Test ${name} must be a ${expected}`;
}
