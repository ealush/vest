import { OPERATION_MODE_STATEFUL } from '../../../constants';
import runWithContext from '../../../lib/runWithContext';
import throwError from '../../../lib/throwError';
import getSuiteState from '../../state/getSuiteState';
import registerSuite from '../registerSuite';
import remove from '../../state/remove';

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
    name = getSuiteState(suiteId).name;
    remove(suiteId);
  } catch {
    /* */
  }

  runWithContext(
    { name, suiteId, operationMode: OPERATION_MODE_STATEFUL },
    registerSuite
  );
};

export default reset;
