import { CB } from 'vest-utils';

import { IsolateReorderable } from 'vestjs-runtime';

import { TVestIsolate, VestIsolateType } from '../VestIsolateType';

export type TIsolateEach = TVestIsolate;

export function IsolateEach<Callback extends CB = CB>(
  callback: Callback,
): TIsolateEach {
  return IsolateReorderable(callback, VestIsolateType.Each, {
    tests: [],
  }) as TIsolateEach;
}
