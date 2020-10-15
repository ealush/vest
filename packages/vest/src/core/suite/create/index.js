import genId from '../../../lib/id';
import throwError from '../../../lib/throwError';
import context from '../../context';
import produce from '../../produce';
import state from '../../state';
import usePending from '../../state/usePending';
import useSuiteId from '../../state/useSuiteId';
import useTestCallbacks from '../../state/useTestCallbacks';
import useTestObjects from '../../state/useTestObjects';
import mergeExcludedTests from '../../test/lib/mergeExcludedTests';
/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} [name]     Identifier for validation suite.
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
    context.bind({ stateRef }, function () {
      const [previousTestObjects = []] = useTestObjects();
      stateRef.reset();

      tests.apply(null, arguments);
      mergeExcludedTests(previousTestObjects);

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
