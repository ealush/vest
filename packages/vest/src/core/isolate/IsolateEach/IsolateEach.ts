import { CB } from 'vest-utils';

import { IsolateReorderable } from '../IsolateReorderable/IsolateReorderable';
import { TVestIsolate, VestIsolateType } from '../VestIsolateType';

export type TIsolateEach = TVestIsolate;

export function IsolateEach<Callback extends CB = CB>(
  callback: Callback,
): TIsolateEach {
  return IsolateReorderable(callback, VestIsolateType.Each);
}
