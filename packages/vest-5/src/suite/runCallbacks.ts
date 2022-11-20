import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from 'SuiteContext';
import { TestWalker } from 'SuiteWalker';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function runFieldCallbacks(fieldName?: string): void {
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
