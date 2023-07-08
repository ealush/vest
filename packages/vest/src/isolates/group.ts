import { CB } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { SuiteContext } from 'SuiteContext';
import { TGroupName } from 'SuiteResultTypes';

export function group<G extends TGroupName>(
  groupName: G,
  callback: CB<void>
): Isolate;
export function group(callback: CB<void>): Isolate;
export function group<G extends TGroupName>(
  ...args: [groupName: G, callback: CB<void>] | [callback: CB<void>]
): Isolate {
  const [callback, groupName] = args.reverse() as [CB<void>, G];

  return Isolate.create(() => {
    SuiteContext.run({ ...(groupName && { groupName }) }, callback);
  });
}
