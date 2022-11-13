import { Isolate, IsolateTypes } from './isolateTypes';

export function createIsolate<T>(
  type: IsolateTypes = IsolateTypes.DEFAULT,
  data?: T | undefined
): Isolate<T> {
  return {
    children: [],
    cursor: 0,
    data,
    type,
  };
}
