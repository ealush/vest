import { TIsolate } from '../Isolate/Isolate';
import { IsolateKeys } from '../Isolate/IsolateKeys';

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
    [IsolateKeys.AbortController]: null,
    ...(status && { status }),
  };
}
