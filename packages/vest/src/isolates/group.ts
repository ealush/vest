import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { SuiteContext } from 'SuiteContext';

export function group(groupName: string, callback: () => void): Isolate {
  return Isolate.create(IsolateTypes.GROUP, () => {
    SuiteContext.run({ groupName }, callback);
  });
}
