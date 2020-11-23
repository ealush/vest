import context from 'ctx';
import genId from 'genId';
import isFunction from 'isFunction';
import mergeExcludedTests from 'mergeExcludedTests';
import produce from 'produce';
import state from 'state';
import throwError from 'throwError';
import usePending from 'usePending';
import useSuiteId from 'useSuiteId';
import useTestCallbacks from 'useTestCallbacks';
import useTestObjects from 'useTestObjects';
import withArgs from 'withArgs';
/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} [name]     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = withArgs(args => {
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
});

export default createSuite;
