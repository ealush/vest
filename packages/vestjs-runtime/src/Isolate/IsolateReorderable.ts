import { CB } from 'vest-utils';

import { Isolate } from './Isolate';

export function IsolateReorderable(
  callback: CB,
  type = 'Reorderable',
  payload: Record<string, any> = {},
) {
  return Isolate.create(type, callback, { ...payload, allowReorder: true });
}
