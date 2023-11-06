import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';
import { IsolateStatus } from 'IsolateStatus';

export function genTestIsolate(data: Record<string, any> = {}): TIsolate {
  return {
    children: [],
    data,
    key: null,
    keys: {},
    output: null,
    parent: null,
    status: IsolateStatus.INITIAL,
    [IsolateKeys.Type]: 'UnitTest',
  };
}
