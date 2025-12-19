import { CB } from 'vest-utils';
import { Isolate, IsolateKey, TIsolate, IsolatePayload } from 'vestjs-runtime';

export const VestIsolateType = {
  Each: 'Each',
  Focused: 'Focused',
  Group: 'Group',
  OmitWhen: 'OmitWhen',
  Reorderable: 'Reorderable',
  SkipWhen: 'SkipWhen',
  Suite: 'Suite',
  Test: 'Test',
};

export type TVestIsolate<P extends IsolatePayload = IsolatePayload> =
  TIsolate<P>;

export function createVestIsolate<Payload extends IsolatePayload>(
  type: string,
  cb: CB,
  payload: Payload,
  key?: IsolateKey,
): TVestIsolate<Payload> {
  return Isolate.create(type, cb, payload, key) as TVestIsolate<Payload>;
}

// Pre-computed Set for O(1) lookups in isVestIsolate
const VestIsolateTypeSet = new Set(Object.values(VestIsolateType));

export function isVestIsolate(
  isolate: TIsolate | null,
): isolate is TVestIsolate {
  // Check if the isolate type is one of the Vest isolate types
  // We cannot rely on data.tests because it's stripped during serialization
  if (!isolate) return false;
  return VestIsolateTypeSet.has((isolate as any).$type);
}
