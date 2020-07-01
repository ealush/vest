import { OPERATION_MODE_STATEFUL } from '../../../constants';
import runWithContext from '../../../lib/runWithContext';
import throwError from '../../../lib/throwError';
import getSuiteState from '../getSuiteState';
import registerSuite from '../registerSuite';
import remove from '../remove';

/**
 * Resets suite to its initial state
 * @param {String} suiteId
 */
const reset = suiteId => {
  if (!suiteId) {
    throwError('`vest.reset` must be called with suiteId.');
  }

  const { name } = getSuiteState(suiteId);
  remove(suiteId);

  runWithContext(
    { name, suiteId, operationMode: OPERATION_MODE_STATEFUL },
    registerSuite
  );
};

export default reset;
