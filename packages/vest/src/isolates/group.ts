import { SuiteContext } from 'SuiteContext';
import { Isolate } from 'isolate';

export function group(groupName: string, callback: () => void): Isolate {
  return Isolate.create(() => {
    SuiteContext.run({ groupName }, callback);
  });
}
