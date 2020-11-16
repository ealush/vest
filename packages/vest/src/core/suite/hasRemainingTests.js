import { isEmpty, isNotEmpty } from 'isEmpty';
import usePending from 'usePending';

/**
 * Checks if a given tests, or the suite as a whole still have remaining tests.
 * @param {string} [fieldName]
 * @returns {Boolean}
 */
const hasRemainingTests = fieldName => {
  const [{ pending, lagging }] = usePending();
  const allIncomplete = pending.concat(lagging);
  if (isEmpty(allIncomplete)) {
    return false;
  }
  if (fieldName) {
    return allIncomplete.some(testObject => testObject.fieldName === fieldName);
  }
  return isNotEmpty(allIncomplete);
};

export default hasRemainingTests;
