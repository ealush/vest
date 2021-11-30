import assign from 'assign';
import isFunction from 'isFunction';
import { isNotString } from 'isString';
import throwError from 'throwError';

import VestTest, { TTestFn } from 'VestTest';
import ctx from 'ctx';
import registerPrevRunTest from 'registerPrevRunTest';
import bindTestEach from 'test.each';
import bindTestMemo from 'test.memo';

function testBase(fieldName: string, message: string, cb: TTestFn): VestTest;
function testBase(fieldName: string, cb: TTestFn): VestTest;
function testBase(
  fieldName: string,
  message: string,
  cb: TTestFn,
  key: string
): VestTest;
function testBase(fieldName: string, cb: TTestFn, key: string): VestTest;
function testBase(
  fieldName: string,
  ...args:
    | [message: string, cb: TTestFn]
    | [cb: TTestFn]
    | [message: string, cb: TTestFn, key: string]
    | [cb: TTestFn, key: string]
): VestTest {
  const [message, testFn, key] = isFunction(args[1])
    ? args
    : ([undefined, ...args] as [
        string | undefined,
        TTestFn,
        string | undefined
      ]);

  if (isNotString(fieldName)) {
    throwIncompatibleParamsError('fieldName', 'string');
  }

  if (!isFunction(testFn)) {
    throwIncompatibleParamsError('Test callback', 'function');
  }

  const context = ctx.useX();
  const testObject = new VestTest(fieldName, testFn, {
    message,
    groupName: context.groupName,
    key,
  });

  return registerPrevRunTest(testObject);
}

export default assign(testBase, {
  each: bindTestEach(testBase),
  memo: bindTestMemo(testBase),
});

export type TTestBase = typeof testBase;

function throwIncompatibleParamsError(name: string, expected: string) {
  throwError(
    `Incompatible params passed to test function. ${name} must be a ${expected}`
  );
}
