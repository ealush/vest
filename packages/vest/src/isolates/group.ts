import { CB } from 'vest-utils';
import { TIsolate, createIsolate } from 'vestjs-runtime';

import { SuiteContext } from 'SuiteContext';
import { TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export function group<G extends TGroupName>(
  groupName: G,
  callback: CB<void>
): TIsolate;
export function group(callback: CB<void>): TIsolate;
export function group<G extends TGroupName>(
  ...args: [groupName: G, callback: CB<void>] | [callback: CB<void>]
): TIsolate {
  const [callback, groupName] = args.reverse() as [CB<void>, G];

  return createIsolate(VestIsolateType.Group, () => {
    SuiteContext.run({ ...(groupName && { groupName }) }, callback);
  });
}
