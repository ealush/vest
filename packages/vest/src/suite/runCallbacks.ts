import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from 'Runtime';
import { TFieldName } from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(fieldName?: TFieldName): void {
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
export function useRunDoneCallbacks() {
  const [doneCallbacks] = useDoneCallbacks();
  callEach(doneCallbacks);
}
