import { VestTest } from 'VestTest';
import { currentTest } from 'ctx';
import { isolate } from 'isolate';

import { TestFn } from 'TestTypes';
import { IsolateTypes } from 'isolateTypes';

function vestTest(name: string, message: string, cb: TestFn): void;
function vestTest(name: string, cb: TestFn): void;
function vestTest(
  name: string,
  ...args: [message: string, cb: TestFn] | [cb: TestFn]
): void {
  const [cb, message] = args.reverse() as [TestFn, string | undefined];

  const test = new VestTest(name, cb, {
    message,
  });

  return isolate(IsolateTypes.TEST, () => {
    currentTest.run(test, () => {
      cb();
    });
  });
}

export { vestTest as test };
