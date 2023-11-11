import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';

export function genTestIsolate(payload: Record<string, any> = {}): TIsolate {
  const { status, ...data } = payload;
  return {
    children: [],
    data,
    key: null,
    keys: {},
    output: null,
    parent: null,
    [IsolateKeys.Type]: 'UnitTest',
    ...(status && { status }),
  };
}
