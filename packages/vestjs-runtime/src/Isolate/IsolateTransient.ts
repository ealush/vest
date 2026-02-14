import { CB } from 'vest-utils';

import { Isolate } from './Isolate';

export function IsolateTransient(
    callback: CB,
    type = 'Transient',
    payload: Record<string, any> = {},
) {
    return Isolate.create(type, callback, { ...payload, transient: true });
}
