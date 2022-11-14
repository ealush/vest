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

  return isolate(IsolateTypes.TEST, () => {
    cb();
  });
}
