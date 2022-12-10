import { Isolate, IsolateTypes } from 'IsolateTypes';

export function createIsolate(
  type: IsolateTypes = IsolateTypes.DEFAULT,
  parent: null | Isolate = null,
  data?: any
): Isolate {
  const isolate = {
    children: [],
    data,
    keys: {},
    parent,
    type,
  };

  return isolate;
}
