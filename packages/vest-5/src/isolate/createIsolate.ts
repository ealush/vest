import { Isolate, IsolateTypes } from 'IsolateTypes';

export function createIsolate(
  type: IsolateTypes = IsolateTypes.DEFAULT,
  data?: any
): Isolate {
  const isolate = {
    children: [],
    cursor: 0,
    data,
    nextCursor,
    type,
  };

  return isolate;

  function nextCursor(): void {
    isolate.cursor++;
  }
}
