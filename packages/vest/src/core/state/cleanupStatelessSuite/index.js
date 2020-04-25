import getSuiteState from '../getSuiteState';
import hasRemainingTests from '../hasRemainingTests';
import { setSuites } from '../index';
/**
 * Removes completed "stateless" suite from state storage.
 * @param {string} suiteId
 */
const cleanupStatelessSuite = suiteId => {
  const state = getSuiteState(suiteId);

  // Needs to be after hasRemainingTests since it uses context.
  if (!hasRemainingTests(state)) {
    setSuites(state => {
      delete state[suiteId];
      return state;
    });
  }
};

export default cleanupStatelessSuite;
