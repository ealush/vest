import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';


export function genTestIsolate(payload: Record<string, any> = {}): TIsolate {
  return {
    children: [],
    key: null,
    keys: {},
    output: null,
    parent: null,
    [IsolateKeys.Type]: 'UnitTest',
    ...payload,
  };
}
