/**
 * Module: `src/Isolate/IsolateTransient.ts`.
 *
 * Provides `IsolateTransient`-related runtime and type utilities used by `vestjs-runtime`.
 */
import { CB } from 'vest-utils';

import { Isolate } from './Isolate';
import type { IsolatePayload, TIsolate } from './IsolateTypes';

/**
 * Creates a transient isolate.
 *
 * Transient isolates are isolates that:
 * 1. Do not persist in the history tree.
 * 2. Are not reconciled with previous runs.
 * 3. Do not appear in the serialized suite dump.
 * 4. Do not interfere with the index of their siblings (they are skipped by the reconciler).
 *
 * This is useful for "structural" isolates that are used for control flow or grouping
 * but do not hold state that needs to be preserved between runs, such as `focused` (skip/only) isolates.
 */
export function IsolateTransient<Payload extends IsolatePayload>(
  callback: CB,
  type = 'Transient',
  payload: Payload = {} as Payload,
): TIsolate<Payload> {
  return Isolate.create<Payload>(type, callback, {
    ...payload,
    transient: true,
  });
}
