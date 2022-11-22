import { Isolate, IsolateTypes } from 'IsolateTypes';

export function createIsolate(
  type: IsolateTypes = IsolateTypes.DEFAULT,
  data?: any
): Isolate {
  return {
    children: [],
    cursor: 0,
    data,
    type,
  };
}
