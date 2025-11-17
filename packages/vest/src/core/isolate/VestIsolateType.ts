import { CB } from 'vest-utils';
import { Isolate, IsolateKey, TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from './IsolateTest/IsolateTest';

export const VestIsolateType = {
  Each: 'Each',
  Focused: 'Focused',
  Group: 'Group',
  OmitWhen: 'OmitWhen',
  SkipWhen: 'SkipWhen',
  Suite: 'Suite',
  Test: 'Test',
};

export type TVestIsolate<P = void> = TIsolate<
  P & {
    tests: TIsolateTest[];
  }
>;

export function createVestIsolate<Payload = Record<string, any>>(
  type: string,
  cb: CB,
  payload: Payload,
  key?: IsolateKey,
): TVestIsolate<Payload> {
  return Isolate.create(
    type,
    cb,
    {
      ...payload,
      tests: [],
    },
    key,
  );
}

export function isVestIsolate(
  isolate: TIsolate | null,
): isolate is TVestIsolate {
  return Array.isArray(isolate?.data?.tests);
}
