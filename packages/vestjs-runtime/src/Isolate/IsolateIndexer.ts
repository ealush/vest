/**
 * Module: `src/Isolate/IsolateIndexer.ts`.
 *
 * Provides `IsolateIndexer`-related runtime and type utilities used by `vestjs-runtime`.
 */
import { isNullish, Nullable } from 'vest-utils';

import { TIsolate } from './IsolateTypes';

export function createHistoryIndex(
  children: Nullable<TIsolate[]>,
): Map<string, TIsolate | TIsolate[]> {
  const index = new Map<string, TIsolate | TIsolate[]>();

  if (!children) {
    return index;
  }

  for (const child of children) {
    addToIndex(index, child);
  }

  return index;
}

function addToIndex(
  index: Map<string, TIsolate | TIsolate[]>,
  isolate: TIsolate,
): void {
  const { key } = isolate;

  if (isNullish(key)) {
    return;
  }

  const existing = index.get(key);

  if (existing) {
    if (Array.isArray(existing)) {
      existing.push(isolate);
    } else {
      index.set(key, [existing, isolate]);
    }
  } else {
    index.set(key, isolate);
  }
}
