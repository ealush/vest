import { VestRuntime } from 'vestjs-runtime';

import { VestTest } from '../isolate/IsolateTest/VestTest';
import matchingFieldName from '../test/helpers/matchingFieldName';

export function usePendingIsolates() {
  const [pending] = VestRuntime.usePendingIsolates();
  return pending;
}

export function useIsPending(fieldName?: string): boolean {
  const pending = usePendingIsolates();

  if (pending.size === 0) {
    return false;
  }

  if (!fieldName) {
    return true;
  }

  for (const isolate of pending) {
    if (matchingFieldName(VestTest.getData(isolate), fieldName).unwrap()) {
      return true;
    }
  }

  return false;
}
