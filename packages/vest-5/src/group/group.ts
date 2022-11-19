import { isolate } from 'isolate';

import { SuiteContext } from '../context/SuiteContext';

import { Isolate, IsolateTypes } from 'isolateTypes';

export function group(groupName: string, callback: () => void): Isolate {
  return isolate(IsolateTypes.GROUP, () => {
    SuiteContext.run({ groupName }, callback);
  });
}
