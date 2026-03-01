import { isArray } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from '../core/Runtime';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
} from '../suiteResult/SuiteResultTypes';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(
  fieldName: TFieldName,
  result: SuiteResult<TFieldName, TGroupName, any, any>,
): void {
  const [fieldCallbacks] = useFieldCallbacks();

  if (isArray(fieldCallbacks[fieldName])) {
    fieldCallbacks[fieldName].forEach(cb => cb(result));
  }
}

/**
 * Runs field callbacks (done callbacks) that can be executed immediately.
 * This happens when a field has non-pending tests (synchronous tests).
 */
export function useRunSyncFieldCallbacks(
  result: SuiteResult<TFieldName, TGroupName, any, any>,
): void {
  const [fieldCallbacks] = useFieldCallbacks();

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
      if (testSummary && testSummary.testCount > testSummary.pendingCount) {
        // Execute all registered callbacks for this field.
        // This is the "nested loop" that iterates over the callbacks array.
        callbacks.forEach(cb => cb(result));
      }
    }
  }
}

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function useRunDoneCallbacks(
  result: SuiteResult<TFieldName, TGroupName, any, any>,
) {
  const [doneCallbacks] = useDoneCallbacks();

  doneCallbacks.forEach(cb => cb(result));
}
