import { callEach } from 'vest-utils';

import { useDoneCallbacks } from 'Runtime';

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function useRunDoneCallbacks() {
  const [doneCallbacks] = useDoneCallbacks();

  callEach(doneCallbacks);
}
