import { OPERATION_MODE_STATELESS } from '../../constants/index';
import id from '../../lib/id';
import runWithContext from '../../lib/runWithContext';
import createSuite from '../createSuite';
import cleanupStatelessSuite from '../state/cleanupStatelessSuite';

/**
 * Creates a suite and immediately invokes it.
 * @param {string} suiteName
 * @param {Function} tests
 */
const validate = (suiteName, tests) => {
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
  cleanupStatelessSuite(suiteId);
  return res;
};

export default validate;
