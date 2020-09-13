import { OPERATION_MODE_STATEFUL } from '../../../constants';
import throwError from '../../../lib/throwError';
import context from '../../context';
import getState from '../getState';
import register from '../register';
import remove from '../remove';

/**
 * Resets suite to its initial state
 * @param {String} suiteId
 */
const reset = suiteId => {
  if (!suiteId) {
    throwError('`vest.reset` must be called with suiteId.');
  }

  let name = suiteId;
  try {
    name = getState(suiteId).name;
    remove(suiteId);
  } catch {
    /* */
  }

  context.run(
    { name, suiteId, operationMode: OPERATION_MODE_STATEFUL },
    register
  );
};

export default reset;
