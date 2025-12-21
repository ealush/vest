import { CB } from 'vest-utils';
import { Isolate, IsolateKey, TIsolate } from 'vestjs-runtime';

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

export type TVestIsolate<P extends Record<string, any> = Record<string, any>> =
  TIsolate<P>;

export function createVestIsolate<
  Payload extends Record<string, any> = Record<string, any>,
>(
  type: string,
  cb: CB,
  payload: Payload,
  key?: IsolateKey,
): TVestIsolate<Payload> {
  return Isolate.create(type, cb, payload, key) as TVestIsolate<Payload>;
}

export function isVestIsolate(
  isolate: TIsolate | null,
): isolate is TVestIsolate {
  return isolate?.$type === VestIsolateType.Suite;
}
