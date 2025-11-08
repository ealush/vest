import { CB } from 'vest-utils';

import {
  createVestIsolate,
  TVestIsolate,
  VestIsolateType,
} from 'VestIsolateType';

type TIsolateEach = TVestIsolate;

export function IsolateEach<Callback extends CB = CB>(
  callback: Callback,
): TIsolateEach {
  return createVestIsolate(VestIsolateType.Each, callback, {
    allowReorder: true,
  });
}
