import { CB } from 'vest-utils';
import { TIsolate, Isolate, isolateInterfaces } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';

type TIsolateEach = TIsolate & isolateInterfaces.IReorderable;

export function IsolateEach<Callback extends CB = CB>(
  callback: Callback
): TIsolateEach {
  return Isolate.create(VestIsolateType.Each, callback, {
    allowReorder: true,
  });
}
