import { Isolate, IsolateTypes } from 'IsolateTypes';

export function createIsolate(
  type: IsolateTypes = IsolateTypes.DEFAULT,
  data?: any
): Isolate {
  const isolate = {
    children: [],
    data,
    type,
  };

  return isolate;
}
