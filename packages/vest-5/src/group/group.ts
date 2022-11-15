import { currentGroup } from 'ctx';
import { isolate } from 'isolate';
import { IsolateTypes } from 'isolateTypes';

export function group(name: string, callback: () => void): void {
  return isolate(IsolateTypes.GROUP, () => {
    currentGroup.run(name, callback);
  });
}
