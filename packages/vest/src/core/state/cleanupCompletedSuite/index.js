import getState from '../../suite/getState';
import hasRemainingTests from '../../suite/hasRemainingTests';
import remove from '../../suite/remove';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} suiteId
 */
const cleanupCompletedSuite = suiteId => {
  const state = getState(suiteId);

  if (hasRemainingTests(state)) {
    return;
  }
  remove(suiteId);
};

export default cleanupCompletedSuite;
