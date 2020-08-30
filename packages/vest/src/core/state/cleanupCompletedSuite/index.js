import getSuiteState from '../getSuiteState';
import hasRemainingTests from '../../suite/hasRemainingTests';
import remove from '../remove';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} suiteId
 */
const cleanupCompletedSuite = suiteId => {
  const state = getSuiteState(suiteId);

  if (hasRemainingTests(state)) {
    return;
  }
  remove(suiteId);
};

export default cleanupCompletedSuite;
