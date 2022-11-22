import { Isolate, IsolateTypes } from 'IsolateTypes';

import { SuiteContext } from '../context/SuiteContext';

import { isolate } from 'isolate';

export function group(groupName: string, callback: () => void): Isolate {
  return isolate(IsolateTypes.GROUP, () => {
    SuiteContext.run({ groupName }, callback);
  });
}
