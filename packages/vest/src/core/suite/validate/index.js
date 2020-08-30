import { OPERATION_MODE_STATELESS } from '../../../constants/index';
import id from '../../../lib/id';
import runWithContext from '../../../lib/runWithContext';
import validateSuiteParams from '../../../lib/validateSuiteParams/index';
import create from '../create';
import cleanupCompleted from '../cleanupCompleted';

/**
 * Creates a suite and immediately invokes it.
 * @param {string} suiteName
 * @param {Function} tests
 */
const validate = (suiteName, tests) => {
  validateSuiteParams('validate', suiteName, tests);
  const suiteId = id();
  const res = runWithContext(
    {
      name: suiteName,
      suiteId,
      operationMode: OPERATION_MODE_STATELESS,
    },
    () => {
      const suite = create(suiteName, tests);
      if (typeof suite === 'function') {
        return suite();
      }
    }
  );
  cleanupCompleted(suiteId);
  return res;
};

export default validate;
