import { isString } from 'isString';
import { assign, invariant, isFunction } from 'vest-utils';

import VestTest, { TestFn } from 'VestTest';
import ctx from 'ctx';
import registerPrevRunTest from 'registerPrevRunTest';
import bindTestMemo from 'test.memo';

function testBase(fieldName: string, message: string, cb: TestFn): VestTest;
function testBase(fieldName: string, cb: TestFn): VestTest;
function testBase(
  fieldName: string,
  message: string,
  cb: TestFn,
  key: string
): VestTest;
function testBase(fieldName: string, cb: TestFn, key: string): VestTest;
function testBase(
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

  invariant(
    isString(fieldName),
    incompatibleParamsError('fieldName', 'string')
  );

  invariant(
    isFunction(testFn),
    incompatibleParamsError('Test callback', 'function')
  );

  const context = ctx.useX();
  const testObject = new VestTest(fieldName, testFn, {
    message,
    groupName: context.groupName,
    key,
  });

  return registerPrevRunTest(testObject);
}

/**
 * Represents a single case in a validation suite.
 *
 * @example
 *
 * test("username", "Username is required", () => {
 *  enforce(data.username).isNotBlank();
 * });
 */
export const test = assign(testBase, {
  memo: bindTestMemo(testBase),
});

export type TestBase = typeof testBase;

function incompatibleParamsError(name: string, expected: string) {
  return `Incompatible params passed to test function. ${name} must be a ${expected}`;
}
