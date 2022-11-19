import { VestTest } from 'VestTest';
import { isolate } from 'isolate';

import { SuiteContext } from '../context/SuiteContext';

import { TestFn } from 'TestTypes';
import { IsolateTypes } from 'isolateTypes';

function vestTest(fieldName: string, message: string, cb: TestFn): VestTest;
function vestTest(fieldName: string, cb: TestFn): VestTest;
function vestTest(
  fieldName: string,
  ...args: [message: string, cb: TestFn] | [cb: TestFn]
): VestTest {
  const [cb, message] = args.reverse() as [TestFn, string | undefined];

  const test = new VestTest(fieldName, cb, {
    message,
  });

  isolate(
    IsolateTypes.TEST,
    () => {
      SuiteContext.run({ currentTest: test }, () => {
        // TODO: Register logic here
        test.run();
      });
    },
    test
  );

  return test;
}

export { vestTest as test };
