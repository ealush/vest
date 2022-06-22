import { isArray, callEach } from 'vest-utils';

import hasRemainingTests from 'hasRemainingTests';
import { useTestCallbacks } from 'stateHooks';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function runFieldCallbacks(fieldName?: string): void {
  const [{ fieldCallbacks }] = useTestCallbacks();

  if (
    fieldName &&
    !hasRemainingTests(fieldName) &&
    isArray(fieldCallbacks[fieldName])
  ) {
    callEach(fieldCallbacks[fieldName]);
  }
}

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function runDoneCallbacks() {
  const [{ doneCallbacks }] = useTestCallbacks();
  callEach(doneCallbacks);
}
