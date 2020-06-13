import singleton from '../../lib/singleton';
import throwError from '../../lib/throwError';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import get from '../get';

/**
 * @returns {Object} Current output object.
 */
const draft = () => {
  const ctx = singleton.useContext();

  if (ctx?.suiteId === undefined) {
    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
    return;
  }

  return get(ctx.suiteId);
};

export default draft;
