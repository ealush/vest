import { SuiteContext } from 'SuiteContext';
import { TGroupName } from 'SuiteResultTypes';
import { Isolate } from 'isolate';

export function group<G extends TGroupName>(
  groupName: G,
  callback: () => void
): Isolate {
  return Isolate.create(() => {
    SuiteContext.run({ groupName }, callback);
  });
}
