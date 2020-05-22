import produce from '../../core/produce';
import getSuiteState from '../../core/state/getSuiteState';
import singleton from '../../lib/singleton';
import throwError from '../../lib/throwError';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';

/**
 * @returns {Object} Current output object.
 */
const draft = () => {
  const ctx = singleton.useContext();

  if (ctx?.suiteId === undefined) {
    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
    return;
  }
  const state = getSuiteState(ctx.suiteId);
  return produce(state, { draft: true });
};

export default draft;
