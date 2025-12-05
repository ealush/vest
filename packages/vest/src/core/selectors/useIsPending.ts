import { TIsolate, VestRuntime } from 'vestjs-runtime';

import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../isolate/IsolateTest/VestTest';
import matchingFieldName from '../test/helpers/matchingFieldName';

/**
 * Retrieves the Set of pending isolates from the runtime.
 */
export function usePendingIsolates() {
  const [pending] = VestRuntime.usePendingIsolates();
  return pending;
}

/**
 * Checks if there are any pending isolates.
 * If a fieldName is provided, it checks if there are any pending isolates for that specific field.
 */
export function useIsPending(fieldName?: string): boolean {
  return (
    useMapFirstPending((isolate, breakout) => {
      if (!fieldName) {
        breakout(true);
        return;
      }

      if (
        matchingFieldName(
          VestTest.getData(isolate as TIsolateTest),
          fieldName,
        ).unwrap()
      ) {
        breakout(true);
      }
    }) ?? false
  );
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
  const pending = usePendingIsolates();

  for (const isolate of pending) {
    let result: T | null = null;
    let broke = false;

    callback(isolate, value => {
      broke = true;
      result = value;
    });

    if (broke) {
      return result;
    }
  }

  return null;
}
