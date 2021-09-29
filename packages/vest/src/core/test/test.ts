import assign from 'assign';

import VestTest, { TTestFn } from 'VestTest';
import ctx from 'ctx';
import registerPrevRunTest from 'registerPrevRunTest';
import bindTestEach from 'test.each';
import bindTestMemo from 'test.memo';

function testBase(
  fieldName: string,
  ...args: [message: string, cb: TTestFn]
): VestTest;
function testBase(fieldName: string, ...args: [cb: TTestFn]): VestTest;
function testBase(
  fieldName: string,
  ...args: [message: string, cb: TTestFn] | [cb: TTestFn]
): VestTest {
  const [testFn, message] = args.reverse() as [TTestFn, string | undefined];
  const context = ctx.useX();
  const testObject = new VestTest(fieldName, testFn, {
    message,
    groupName: context?.groupName,
  });

  return registerPrevRunTest(testObject);
}

export default assign(testBase, {
  each: bindTestEach(testBase),
  memo: bindTestMemo(testBase),
});

export type TTestBase = typeof testBase;
