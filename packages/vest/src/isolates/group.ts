import { IsolateTypes } from 'IsolateTypes';
import { SuiteContext } from 'SuiteContext';
import { Isolate } from 'isolate';

export function group(groupName: string, callback: () => void): Isolate {
  const [groupIsolate] = Isolate.create(IsolateTypes.GROUP, () => {
    SuiteContext.run({ groupName }, callback);
  });

  return groupIsolate;
}
