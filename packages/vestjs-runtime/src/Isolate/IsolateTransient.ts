import { CB } from 'vest-utils';

import { Isolate } from './Isolate';

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
export function IsolateTransient(
  callback: CB,
  type = 'Transient',
  payload: Record<string, any> = {},
) {
  return Isolate.create(type, callback, { ...payload, transient: true });
}
