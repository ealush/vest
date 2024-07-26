import { CB } from 'vest-utils';
import { TIsolate, Isolate } from 'vestjs-runtime';


import { SuiteContext } from '@/core/context/SuiteContext';
import { VestIsolateType } from '@/core/isolate/VestIsolateType';
import { TGroupName } from '@/suiteResult/SuiteResultTypes';

export function group<G extends TGroupName>(
  groupName: G,
  callback: CB<void>
): TIsolate;
export function group(callback: CB<void>): TIsolate;
export function group<G extends TGroupName>(
  ...args: [groupName: G, callback: CB<void>] | [callback: CB<void>]
): TIsolate {
  const [callback, groupName] = args.reverse() as [CB<void>, G];

  return Isolate.create(
    VestIsolateType.Group,
    () => {
      return SuiteContext.run({ ...(groupName && { groupName }) }, callback);
    },
  );
}
