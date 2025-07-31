import { CB } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { TGroupName } from 'SuiteResultTypes';
import {
  createVestIsolate,
  TVestIsolate,
  VestIsolateType,
} from 'VestIsolateType';

export function group<G extends TGroupName>(
  groupName: G,
  callback: CB<void>,
): TIsolate;
export function group(callback: CB<void>): TIsolate;
export function group<G extends TGroupName>(
  ...args: [groupName: G, callback: CB<void>] | [callback: CB<void>]
): TIsolateGroup<G> {
  const [callback, groupName] = args.reverse() as [CB<void>, G];

  return createVestIsolate(VestIsolateType.Group, callback, {
    groupName,
  });
}

export type TIsolateGroup<G extends TGroupName> = TVestIsolate<{
  groupName: G;
}>;
