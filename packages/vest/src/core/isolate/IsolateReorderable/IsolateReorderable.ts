import { CB , ValueOf } from 'vest-utils';

import {
  createVestIsolate,
  TVestIsolate,
  VestIsolateType,
} from '../VestIsolateType';

type TIsolateReorderable = TVestIsolate;

export function IsolateReorderable<Callback extends CB = CB>(
  callback: Callback,
  type?: ValueOf<typeof VestIsolateType>,
): TIsolateReorderable {
  return createVestIsolate(type ?? VestIsolateType.Reorderable, callback, {
    allowReorder: true,
  });
}
