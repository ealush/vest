import { Isolate, IsolateTypes } from 'IsolateTypes';

export function createIsolate(
  type: IsolateTypes = IsolateTypes.DEFAULT,
  parent = null,
  data?: any
): Isolate {
  const isolate = {
    children: [],
    cursor: 0,
    data,
    parent,
    type,
  };

  return isolate;
}
