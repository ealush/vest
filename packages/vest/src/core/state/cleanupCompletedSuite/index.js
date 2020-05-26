import getSuiteState from '../getSuiteState';
import hasRemainingTests from '../hasRemainingTests';
import reset from '../reset';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} suiteId
 */
const cleanupCompletedSuite = suiteId => {
  const state = getSuiteState(suiteId);

  if (hasRemainingTests(state)) {
    return;
  }
  reset(suiteId);
};

export default cleanupCompletedSuite;
