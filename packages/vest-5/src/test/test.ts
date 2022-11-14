import { isolate } from 'isolate';

import { IsolateTypes } from 'isolateTypes';

type TestCallback = () => void | false | Promise<void | false | string>;

function vestTest(name: string, message: string, cb: TestCallback): void;
function vestTest(name: string, cb: TestCallback): void;
function vestTest(
  name: string,
  ...args: [message: string, cb: TestCallback] | [cb: TestCallback]
): void {
  const [cb, message] = args.reverse() as [TestCallback, string | undefined];

  return isolate(IsolateTypes.TEST, () => {
    cb();
  });
}
