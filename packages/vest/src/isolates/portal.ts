import { CB } from 'vest-utils';
import { TIsolate, Isolate } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';

export function portal<D>(callback: CB<void, [D]>): TIsolate {
  return Isolate.create(VestIsolateType.Portal, callback);
}
