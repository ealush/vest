import genId from '../../../lib/id';
import throwError from '../../../lib/throwError';
import context from '../../context';
import produce from '../../produce';
import useTestCallbacks from '../../produce/useTestCallbacks';
import state from '../../state';
import mergeExcludedTests from '../../test/lib/mergeExcludedTests';
import usePending from '../../test/lib/pending/usePending';
import useTestObjects from '../../test/useTestObjects';
import useSuiteId from '../useSuiteId';
/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = (...args) => {
  const [tests, name] = args.reverse();

  if (typeof tests !== 'function') {
    throwError(
      'Suite initialization error. Expected `tests` to be a function.'
    );
  }

  const stateRef = state.createRef({
    usePending,
    useSuiteId: [useSuiteId, [genId(), name]],
    useTestCallbacks,
    useTestObjects,
  });

  return Object.defineProperties(
    context.bind({ stateRef }, (...args) => {
      stateRef.unshift();

      tests.apply(null, args);
      mergeExcludedTests();

      return produce();
    }),
    {
      get: {
        value: context.bind({ stateRef }, produce, { draft: true }),
      },
      name: { value: 'validate' },
      reset: { value: stateRef.reset },
    }
  );
};

export default createSuite;
