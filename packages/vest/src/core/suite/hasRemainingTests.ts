import { isEmpty, isNotEmpty } from 'isEmpty';

import { useAllIncomplete } from 'stateHooks';

/**
 * Checks if a given tests, or the suite as a whole still have remaining tests.
 */
function hasRemainingTests(fieldName?: string): boolean {
  const allIncomplete = useAllIncomplete();
  if (isEmpty(allIncomplete)) {
    return false;
  }
  if (fieldName) {
    return allIncomplete.some(testObject => testObject.fieldName === fieldName);
  }
  return isNotEmpty(allIncomplete);
}

export default hasRemainingTests;
