import { Isolate, IsolateTypes } from 'IsolateTypes';

export function isIsolateType(isolate: Isolate, type: IsolateTypes): boolean {
  return isolate.type === type;
}

export function isTestIsolate(isolate: Isolate): boolean {
  return isIsolateType(isolate, IsolateTypes.TEST);
}
