import { CB, makeBrand } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import {
  createVestIsolate,
  TVestIsolate,
  VestIsolateType,
} from '../core/isolate/VestIsolateType';
import { TGroupName } from '../suiteResult/SuiteResultTypes';

export function group(groupName: string, callback: CB<void>): TIsolate;
export function group(callback: CB<void>): TIsolate;
export function group(
  ...args: [groupName: string, callback: CB<void>] | [callback: CB<void>]
): TIsolateGroup<TGroupName> {
  const [callback, groupName] = args.reverse() as [
    CB<void>,
    string | undefined,
  ];
  const safeGroupName =
    groupName === undefined ? undefined : makeBrand<TGroupName>(groupName);

  return createVestIsolate(VestIsolateType.Group, callback, {
    groupName: safeGroupName as TGroupName,
  });
}

export type TIsolateGroup<G extends TGroupName = TGroupName> = TVestIsolate<{
  groupName: G;
}>;
