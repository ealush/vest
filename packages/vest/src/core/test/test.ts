import assign from 'assign';
import isFunction from 'isFunction';

import VestTest, { TTestFn } from 'VestTest';
import ctx from 'ctx';
import { isExcluded } from 'exclusive';
import registerTest from 'registerTest';
import {
  useSkippedTests,
  useTestAtCursor,
  useSetTestAtCursor,
  useSetNextCursorAt,
} from 'stateHooks';
import bindTestEach from 'test.each';
import bindTestMemo from 'test.memo';

function testBase(
  fieldName: string,
  ...args: [message: string, cb: TTestFn]
): VestTest;
function testBase(fieldName: string, ...args: [cb: TTestFn]): VestTest;
// eslint-disable-next-line max-statements
function testBase(
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

  const prevRunTest = useTestAtCursor(testObject);

  if (isExcluded(testObject)) {
    setSkippedTests(skippedTests => skippedTests.concat(testObject));
    testObject.skip();
    useSetNextCursorAt();
    return prevRunTest;
  }

  useSetTestAtCursor(testObject);
  useSetNextCursorAt(); // maybe somehow do this only in one place?

  if (!isFunction(testFn)) return testObject;

  registerTest(testObject);

  return testObject;
}

export default assign(testBase, {
  each: bindTestEach(testBase),
  memo: bindTestMemo(testBase),
});

export type TTestBase = typeof testBase;
