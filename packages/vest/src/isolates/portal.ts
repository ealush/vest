import { CB, noop } from 'vest-utils';
import { TIsolate, Isolate } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';

export function portal<D>(callback: CB<any, [D]>): TIsolate {
  return Isolate.create(VestIsolateType.Portal, noop, {
    status: PortalStatus.Pending,
    callback,
  });
}

export enum PortalStatus {
  Pending = 'pending',
  Resolved = 'resolved',
}
