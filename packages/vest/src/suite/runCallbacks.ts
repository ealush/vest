import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from '@/core/Runtime';
import { SuiteWalker } from '@/suite/SuiteWalker';
import { TFieldName } from '@/suiteResult/SuiteResultTypes';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(fieldName?: TFieldName): void {
  const [fieldCallbacks] = useFieldCallbacks();

  if (
    fieldName &&
    !SuiteWalker.useHasRemainingWithTestNameMatching(fieldName) &&
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
