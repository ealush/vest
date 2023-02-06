import { IsolateTypes } from 'IsolateTypes';
import { Isolate } from 'isolate';

export function isIsolateType(isolate: Isolate, type: IsolateTypes): boolean {
  return isolate.type === type;
}
