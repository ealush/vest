import { isArray, callEach } from 'vest-utils';

import { useDoneCallbacks, useFieldCallbacks } from 'Runtime';
import { TFieldName } from 'SuiteResultTypes';
import { SuiteWalker } from 'SuiteWalker';

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function useRunDoneCallbacks() {
  const [doneCallbacks] = useDoneCallbacks();
  callEach(doneCallbacks);
}
