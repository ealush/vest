import { setSuites } from '..';
import throwError from '../../../lib/throwError';
import getSuiteState from '../getSuiteState';
import setCanceled from '../setCanceled';

/**
 * Cleans up a suite from state.
 * @param {string} suiteId
 */
const reset = suiteId => {
  if (!suiteId) {
    throwError('`vest.reset` must be called with suiteId.');
  }

  const suite = getSuiteState(suiteId);

  if (!suite) {
    return;
  }

  setCanceled(...(suite.pending || []));
  setCanceled(...(suite.lagging || []));

  setSuites(state => {
    delete state[suiteId];
    return state;
  });
};

export default reset;
