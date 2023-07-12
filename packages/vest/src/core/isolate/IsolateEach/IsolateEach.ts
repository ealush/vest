import { CB } from 'vest-utils';
import { TIsolate, createIsolate, isolateInterfaces } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';

type TIsolateEach = TIsolate & isolateInterfaces.IReorderable;

export function IsolateEach<Callback extends CB = CB>(
  callback: Callback
): TIsolateEach {
  return createIsolate(VestIsolateType.Each, callback, {
    allowReorder: true,
  });
}
