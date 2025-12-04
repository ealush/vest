import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from '../core/Runtime';
import { TestWalker } from '../core/isolate/IsolateTest/TestWalker';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { TFieldName } from '../suiteResult/SuiteResultTypes';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(fieldName: TFieldName): void {
  const [fieldCallbacks] = useFieldCallbacks();

  if (isArray(fieldCallbacks[fieldName])) {
    callEach(fieldCallbacks[fieldName]);
  }
}

export function useRunSyncFieldCallbacks(): void {
  const [fieldCallbacks] = useFieldCallbacks();

  for (const fieldName in fieldCallbacks) {
    if (
      isArray(fieldCallbacks[fieldName]) &&
      TestWalker.someTests(
        test =>
          VestTest.getData(test).fieldName === fieldName &&
          !VestTest.isPending(test),
      )
    ) {
      callEach(fieldCallbacks[fieldName]);
    }
  }
}

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function useRunDoneCallbacks() {
  const [doneCallbacks] = useDoneCallbacks();

  callEach(doneCallbacks);
}
