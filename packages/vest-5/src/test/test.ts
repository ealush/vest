import { TestFn } from 'TestTypes';
import { VestTest } from 'VestTest';
import { currentTest } from 'ctx';
import { isolate } from 'isolate';
import { IsolateTypes } from 'isolateTypes';

function vestTest(name: string, message: string, cb: TestFn): VestTest;
function vestTest(name: string, cb: TestFn): VestTest;
function vestTest(
  name: string,
  ...args: [message: string, cb: TestFn] | [cb: TestFn]
): VestTest {
  const [cb, message] = args.reverse() as [TestFn, string | undefined];

  const test = new VestTest(name, cb, {
    message,
  });

  return isolate(IsolateTypes.TEST, () => {
    return currentTest.run(test, () => {
      test.run();

      return test;
    });
  });
}

export { vestTest as test };
