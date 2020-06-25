/**
 * Checks if a given tests, or the suite as a whole still have remaining tests.
 */
const hasRemainingTests = (state: ISuiteState, fieldName?: string): boolean => {
  const allIncomplete = [...state.pending, ...state.lagging];
  if (!allIncomplete.length) {
    return false;
  }
  if (fieldName) {
    return allIncomplete.some(testObject => testObject.fieldName === fieldName);
  }
  return Boolean(allIncomplete.length);
};

export default hasRemainingTests;
