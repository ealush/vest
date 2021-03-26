import createStateRef from 'createStateRef';

import asArray from 'asArray';
import context from 'ctx';
import genId from 'genId';
import isFunction from 'isFunction';
import mergeExcludedTests from 'mergeExcludedTests';
import produce from 'produce';
import createState from 'state';
import throwError from 'throwError';
import usePending from 'usePending';
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

  const state = createState();

  const handlers = [];
  const stateRef = createStateRef(state, { suiteId: genId(), name });

  /*
    context.bind returns our `validate` function
    We then wrap it with defineProperties to add
    the `get`, and `reset` functions.

  */
  const suite = context.bind({ stateRef }, function () {
    const [previousTestObjects] = useTestObjects();
    const [{ pending }, setPending] = usePending();
    state.reset();

    // Move all the active pending tests to the lagging array
    setPending({ lagging: pending, pending: [] });

    // Run the consumer's callback
    tests.apply(null, arguments);

    // Merge all the skipped tests with their previous results
    mergeExcludedTests(previousTestObjects);

    return produce();
  });
  suite.get = context.bind({ stateRef }, produce, /*isDraft:*/ true);
  suite.reset = state.reset;
  suite.remove = context.bind({ stateRef }, name => {
    const [testObjects] = useTestObjects();

    // We're mutating the array in `cancel`, so we have to first copy it.
    asArray(testObjects).forEach(testObject => {
      if (testObject.fieldName === name) {
        testObject.cancel();
      }
    });
  });

  suite.subscribe = function (handler) {
    if (!isFunction(handler)) return;

    handlers.push(handler);

    handler({
      type: 'suiteSubscribeInit',
      suiteState: stateRef.current(),
    });
  };

  return suite;
});

export default createSuite;
