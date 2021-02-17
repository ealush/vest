import asArray from 'asArray';
import callEach from 'callEach';
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
  const suiteSubscribers = [];

  const stateRef = state.createRef(
    {
      usePending,
      useSuiteId: [useSuiteId, [genId(), name]],
      useTestCallbacks,
      useTestObjects,
    },
    (state, key, value) => {
      suiteSubscribers.forEach(sub => sub(state, key, value));
    }
  );

  /*
    context.bind returns our `validate` function
    We then wrap it with defineProperties to add
    the `get`, and `reset` functions.

  */
  const suite = context.bind({ stateRef }, function () {
    const [previousTestObjects] = useTestObjects();
    const [{ pending }, setPending] = usePending();
    stateRef.reset();

    // Move all the active pending tests to the lagging array
    setPending({ lagging: pending, pending: [] });

    // Run the consumer's callback
    tests.apply(null, arguments);

    // Merge all the skipped tests with their previous results
    mergeExcludedTests(previousTestObjects);

    return produce();
  });
  suite.get = context.bind({ stateRef }, produce, /*isDraft:*/ true);
  suite.reset = stateRef.reset;
  suite.remove = context.bind({ stateRef }, name => {
    const [testObjects] = useTestObjects();

    // We're mutating the array in `cancel`, so we have to first copy it.
    asArray(testObjects).forEach(testObject => {
      if (testObject.fieldName === name) {
        testObject.cancel();
      }
    });
  });
  suite.subscribe = subscriber => {
    if (!isFunction(subscriber)) {
      return;
    }

    suiteSubscribers.push(subscriber);
    return subscriber(stateRef.current());
  };
  return suite;
});

export default createSuite;
