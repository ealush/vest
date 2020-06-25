import { OPERATION_MODE_STATELESS } from '../../constants';
import id from '../../lib/id';
import runWithContext from '../../lib/runWithContext';
import validateSuiteParams from '../../lib/validateSuiteParams';
import createSuite from '../createSuite';
import cleanupCompletedSuite from '../state/cleanupCompletedSuite';

/**
 * Creates a suite and immediately invokes it.
 */
const validate = (suiteName: string, tests: () => void) => {
  validateSuiteParams('validate', suiteName, tests);
  const suiteId = id();
  const res = runWithContext(
    {
      name: suiteName,
      suiteId,
      operationMode: OPERATION_MODE_STATELESS,
    },
    () => {
      const suite = createSuite(suiteName, tests);
      if (typeof suite === 'function') {
        return suite();
      }
    }
  );
  cleanupCompletedSuite(suiteId);
  return res;
};

export default validate;
