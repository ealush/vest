import { Isolate, IsolateTest, IsolateTypes } from 'IsolateTypes';

export function isIsolateType(isolate: Isolate, type: IsolateTypes): boolean {
  return isolate.type === type;
}

export function isTestIsolate(isolate: Isolate): isolate is IsolateTest {
  return isIsolateType(isolate, IsolateTypes.TEST);
}
