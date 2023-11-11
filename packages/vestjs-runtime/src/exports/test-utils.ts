import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';

export function genTestIsolate(data: Record<string, any> = {}): TIsolate {
  return {
    children: [],
    data,
    key: null,
    keys: {},
    output: null,
    parent: null,
    [IsolateKeys.Type]: 'UnitTest',
  };
}
