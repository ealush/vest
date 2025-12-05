import { isArray, callEach, greaterThan } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from '../core/Runtime';
import { TFieldName } from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(fieldName: TFieldName): void {
  const [fieldCallbacks] = useFieldCallbacks();

  if (isArray(fieldCallbacks[fieldName])) {
    callEach(fieldCallbacks[fieldName]);
  }
}

/**
 * Runs field callbacks (done callbacks) that can be executed immediately.
 * This happens when a field has non-pending tests (synchronous tests).
 */
export function useRunSyncFieldCallbacks(): void {
  const [fieldCallbacks] = useFieldCallbacks();
  const result = useCreateSuiteResult();

  // Iterate over all fields that have registered done callbacks
  for (const fieldName in fieldCallbacks) {
    // Get the array of callbacks for the current field
    const callbacks = fieldCallbacks[fieldName];

    if (isArray(callbacks)) {
      // Get the summary stats for this field from the suite result
      const testSummary = result.tests[fieldName];

      // Check if the field has any tests that are NOT pending.
      // testCount is the total number of tests for the field.
      // pendingCount is the number of tests currently running (async).
      // If testCount > pendingCount, it means there is at least one test
      // that has already finished (synchronous), so we can run the callbacks.
      if (
        testSummary &&
        greaterThan(testSummary.testCount, testSummary.pendingCount)
      ) {
        // Execute all registered callbacks for this field.
        // This is the "nested loop" that iterates over the callbacks array.
        callEach(callbacks);
      }
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
