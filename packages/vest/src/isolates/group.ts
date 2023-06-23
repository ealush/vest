import { CB } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { SuiteContext } from 'SuiteContext';
import { TGroupName } from 'SuiteResultTypes';

export function group<G extends TGroupName>(
  groupName: G,
  callback: CB<void>
): Isolate {
  return Isolate.create(() => {
    SuiteContext.run({ groupName }, callback);
  });
}
