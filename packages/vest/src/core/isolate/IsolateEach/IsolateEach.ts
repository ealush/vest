import { CB } from 'vest-utils';
import { TIsolate, Isolate } from 'vestjs-runtime';

import { VestIsolateType } from '@/core/isolate/VestIsolateType';

type TIsolateEach = TIsolate;

export function IsolateEach<Callback extends CB = CB>(
  callback: Callback,
): TIsolateEach {
  return Isolate.create(VestIsolateType.Each, callback, {
    allowReorder: true,
  });
}
