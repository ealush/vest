import { setSuites } from '..';
import throwError from '../../../lib/throwError';
import { setCanceled } from '../../test/lib/canceled';
import getSuiteState from '../getSuiteState';

/**
 * Cleans up a suite from state.
 */
const reset = (suiteId: string) => {
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
