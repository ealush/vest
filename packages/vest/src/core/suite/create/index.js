import genId from '../../../lib/id';
import isFunction from '../../../lib/isFunction';
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

  if (!isFunction(tests)) {
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

  /*
    context.bind returns our `validate` function
    We then wrap it with defineProperties to add
    the `get`, and `reset` functions.

  */
  return Object.defineProperties(
    context.bind({ stateRef }, function () {
      const [previousTestObjects] = useTestObjects();
      stateRef.reset();

      tests.apply(null, arguments);
      mergeExcludedTests(previousTestObjects);

      return produce();
    }),
    {
      get: {
        value: context.bind({ stateRef }, produce, /*isDraft:*/ true),
      },
      reset: { value: stateRef.reset },
    }
  );
};

export default createSuite;
