import context from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';
import produce from 'produce';
import throwError from 'throwError';

/**
 * @returns {Object} Current output object.
 */
const draft = () => {
  const { stateRef } = context.use();

  if (!stateRef) {
    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
    return;
  }

  return produce(/*isDraft:*/ true);
};

export default draft;
