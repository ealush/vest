import { isEmpty, isNotEmpty } from 'isEmpty';

import { usePending, useLagging } from 'stateHooks';

/**
 * Checks if a given tests, or the suite as a whole still have remaining tests.
 */
function hasRemainingTests(fieldName?: string): boolean {
  const [pending] = usePending();
  const [lagging] = useLagging();
  const allIncomplete = pending.concat(lagging);
  if (isEmpty(allIncomplete)) {
    return false;
  }
  if (fieldName) {
    return allIncomplete.some(testObject => testObject.fieldName === fieldName);
  }
  return isNotEmpty(allIncomplete);
}

export default hasRemainingTests;
