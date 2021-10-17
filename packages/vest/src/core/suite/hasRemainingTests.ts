import { isEmpty, isNotEmpty } from 'isEmpty';

import matchingFieldName from 'matchingFieldName';
import { useAllIncomplete } from 'stateHooks';
/**
 * Checks if a given field, or the suite as a whole still have remaining tests.
 */
function hasRemainingTests(fieldName?: string): boolean {
  const allIncomplete = useAllIncomplete();

  if (isEmpty(allIncomplete)) {
    return false;
  }
  if (fieldName) {
    return allIncomplete.some(testObject =>
      matchingFieldName(testObject, fieldName)
    );
  }

  return isNotEmpty(allIncomplete);
}

export default hasRemainingTests;
