import { Isolate, IsolateTypes } from 'IsolateTypes';
import { createIsolateCursor } from 'isolateCursor';

export function generateIsolate(
  type: IsolateTypes,
  path: number[] = []
): Isolate {
  return {
    cursor: createIsolateCursor(),
    keys: {
      current: {},
      prev: {},
    },
    path,
    type,
  };
}
