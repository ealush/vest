import isFunction from 'isFunction';

import VestTest, { TTestFn } from 'VestTest';
import ctx from 'ctx';
import { isExcluded } from 'exclusive';
import mergeCarryOverTests from 'mergeCarryOverTests';
import registerTest from 'registerTest';
import { useSkippedTests } from 'stateHooks';
import bindTestEach from 'test.each';
import bindTestMemo from 'test.memo';

export function testBase(
  fieldName: string,
  ...args: [message: string, cb: TTestFn]
): VestTest;
export function testBase(fieldName: string, ...args: [cb: TTestFn]): VestTest;
export function testBase(
  fieldName: string,
  ...args: [message: string, cb: TTestFn] | [cb: TTestFn]
): VestTest {
  const [testFn, message] = args.reverse() as [TTestFn, string | undefined];
  const [, setSkippedTests] = useSkippedTests();
  const context = ctx.use();
  const testObject = new VestTest(fieldName, testFn, {
    message,
    groupName: context?.groupName,
  });

  if (isExcluded(testObject)) {
    setSkippedTests(skippedTests => skippedTests.concat(testObject));
    mergeCarryOverTests(testObject);
    return testObject;
  }

  if (!isFunction(testFn)) {
    return testObject;
  }

  registerTest(testObject);

  return testObject;
}

export default Object.assign(testBase, {
  each: bindTestEach(testBase),
  memo: bindTestMemo(testBase),
});
