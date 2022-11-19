import { currentGroup } from 'ctx';
import { isolate } from 'isolate';
import { Isolate, IsolateTypes } from 'isolateTypes';

export function group(name: string, callback: () => void): Isolate<void> {
  return isolate(IsolateTypes.GROUP, () => {
    currentGroup.run(name, callback);
  });
}
