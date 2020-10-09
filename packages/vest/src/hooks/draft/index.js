import context from '../../core/context';
import produce from '../../core/produce';
import throwError from '../../lib/throwError';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';

/**
 * @returns {Object} Current output object.
 */
const draft = () => {
  const { stateRef } = context.use();

  if (stateRef === undefined) {
    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
    return;
  }

  return produce({ draft: true });
};

export default draft;
