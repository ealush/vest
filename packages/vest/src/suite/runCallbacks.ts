import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from 'Runtime';
import { TFieldName } from 'SuiteResultTypes';
import { SuiteWalker } from 'SuiteWalker';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(fieldName: TFieldName): void {
  const [fieldCallbacks] = useFieldCallbacks();

  if (
    !SuiteWalker.useHasRemainingWithTestNameMatching(fieldName) &&
    isArray(fieldCallbacks[fieldName])
  ) {
    callEach(fieldCallbacks[fieldName]);
  }
}

export function useRunSyncFieldCallbacks(): void {
  const [fieldCallbacks] = useFieldCallbacks();

  for (const fieldName in fieldCallbacks) {
    if (SuiteWalker.useHasRemainingWithTestNameMatching(fieldName)) {
      continue;
    }

    if (isArray(fieldCallbacks[fieldName])) {
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
