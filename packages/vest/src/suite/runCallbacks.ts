import { isArray, callEach } from 'vest-utils';

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

export function useRunSyncFieldCallbacks(): void {
  const [fieldCallbacks] = useFieldCallbacks();
  const result = useCreateSuiteResult();

  for (const fieldName in fieldCallbacks) {
    if (isArray(fieldCallbacks[fieldName])) {
      const testSummary = result.tests[fieldName];

      if (testSummary && testSummary.testCount > testSummary.pendingCount) {
        callEach(fieldCallbacks[fieldName]);
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
