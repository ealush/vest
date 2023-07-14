import { TIsolate } from 'Isolate';

export function genTestIsolate(payload: Record<string, any> = {}): TIsolate {
  return {
    children: [],
    key: null,
    keys: {},
    output: null,
    parent: null,
    type: 'UnitTest',
    ...payload,
  };
}
