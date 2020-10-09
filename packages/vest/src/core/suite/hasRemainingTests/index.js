import usePending from '../../test/lib/pending/usePending';

/**
 * Checks if a given tests, or the suite as a whole still have remaining tests.
 * @param {string} [fieldName]
 * @returns {Boolean}
 */
const hasRemainingTests = fieldName => {
  const [{ pending, lagging }] = usePending();
  const allIncomplete = [...pending, ...lagging];
  if (!allIncomplete.length) {
    return false;
  }
  if (fieldName) {
    return allIncomplete.some(testObject => testObject.fieldName === fieldName);
  }
  return Boolean(allIncomplete.length);
};

export default hasRemainingTests;
