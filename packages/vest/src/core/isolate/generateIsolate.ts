import { createIsolateCursor } from './isolateCursor';

import { Isolate, IsolateTypes } from 'IsolateTypes';

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
