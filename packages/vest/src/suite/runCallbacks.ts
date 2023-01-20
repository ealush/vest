import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from 'PersistedContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestWalker } from 'SuiteWalker';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function runFieldCallbacks(fieldName?: TFieldName): void {
  const [fieldCallbacks] = useFieldCallbacks();

  if (
    fieldName &&
    !TestWalker.hasRemainingTests(fieldName) &&
    isArray(fieldCallbacks[fieldName])
  ) {
    callEach(fieldCallbacks[fieldName]);
  }
}

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function runDoneCallbacks() {
  const [doneCallbacks] = useDoneCallbacks();
  callEach(doneCallbacks);
}
