import getState from '../getState';
import hasRemainingTests from '../hasRemainingTests';
import remove from '../remove';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} suiteId
 */
const cleanupCompleted = suiteId => {
  const state = getState(suiteId);

  if (hasRemainingTests(state)) {
    return;
  }
  remove(suiteId);
};

export default cleanupCompleted;
