import hasRemainingTests from '../hasRemainingTests';
import * as suiteState from '../suiteState';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} suiteId
 */
const cleanupCompleted = suiteId => {
  const state = suiteState.getState(suiteId);

  if (hasRemainingTests(state)) {
    return;
  }
  suiteState.remove(suiteId);
};

export default cleanupCompleted;
