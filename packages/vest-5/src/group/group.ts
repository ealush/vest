import { SuiteContext } from '../context/SuiteContext';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import { isolate } from 'isolate';

export function group(groupName: string, callback: () => void): Isolate {
  const [groupIsolate] = isolate(IsolateTypes.GROUP, () => {
    SuiteContext.run({ groupName }, callback);
  });

  return groupIsolate;
}
