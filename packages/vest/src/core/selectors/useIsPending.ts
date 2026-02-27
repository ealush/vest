/**
 * Module: `src/core/selectors/useIsPending.ts`.
 *
 * Provides `useIsPending`-related runtime and type utilities used by `vest`.
 */
import {
  IsolateInspector,
  TIsolate,
  VestRuntime,
  Walker,
} from 'vestjs-runtime';

import { useHasFromRegistry } from '../test/TestRegistry';

/**
 * Checks if there are any pending isolates.
 * If a fieldName is provided, it checks if there are any pending isolates for that specific field.
 */
export function useIsPending(fieldName?: string): boolean {
  return useHasFromRegistry('pending', fieldName);
}

/**
 * Iterates over the pending isolates and applies a callback to each.
 * The callback receives the isolate and a breakout function.
 * Calling the breakout function stops the iteration and returns the value passed to it.
 * If the iteration completes without calling breakout, it returns null.
 */
export function useMapFirstPending<T>(
  callback: (isolate: TIsolate, breakout: (value: T) => void) => void,
): T | null {
  const root = VestRuntime.useAvailableRoot();

  if (!IsolateInspector.hasPending(root)) {
    return null;
  }

  return Walker.mapFirst(root, callback);
}
