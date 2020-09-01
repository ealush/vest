import getState from '../../suite/getState';
import hasRemainingTests from '../../suite/hasRemainingTests';
import remove from '../../suite/remove';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} Id
 */
const cleanupCompleted = Id => {
  const state = getState(Id);

  if (hasRemainingTests(state)) {
    return;
  }
  remove(Id);
};

export default cleanupCompleted;
