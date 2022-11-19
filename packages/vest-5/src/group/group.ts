import { CurrentGroupContext } from 'ctx';
import { isolate } from 'isolate';

import { Isolate, IsolateTypes } from 'isolateTypes';

export function group(name: string, callback: () => void): Isolate {
  return isolate(IsolateTypes.GROUP, () => {
    CurrentGroupContext.run(name, callback);
  });
}
