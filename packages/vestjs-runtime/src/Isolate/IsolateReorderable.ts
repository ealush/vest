import { CB } from 'vest-utils';

import { Isolate } from './Isolate';

export function IsolateReorderable<Payload extends Record<string, any>>(
  callback: CB,
  type = 'Reorderable',
  payload: Payload = {} as Payload,
) {
  return Isolate.create(type, callback, { ...payload, allowReorder: true });
}
