import { TIsolate } from 'Isolate';

export function genTestIsolate(data: Record<string, any> = {}): TIsolate {
  return {
    children: [],
    data,
    key: null,
    keys: {},
    output: null,
    parent: null,
    type: 'UnitTest',
  };
}
