import { OPERATION_MODE_STATEFUL } from '../../../constants';
import { get } from '../../../hooks';
import runWithContext from '../../../lib/runWithContext';
import validateSuiteParams from '../../../lib/validateSuiteParams';
import Context from '../../Context';
import produce from '../../produce';
import { getSuite } from '../state';
import getSuiteState from '../getState';
import registerSuite from '../../state/registerSuite';
import reset from '../reset';
import mergeExcludedTests from '../../test/lib/mergeExcludedTests';

/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = (name, tests) => {
  validateSuiteParams('vest.create', name, tests);

  const ctx = Context.use();

  const ctxRef = {
    suiteId: ctx?.suiteId || name,
    operationMode: ctx?.operationMode || OPERATION_MODE_STATEFUL,
    name,
  };

  /**
   * Initialize empty suite state. This is not required for vest
   * itself, but it is handy to have a default value when using
   * UI frameworks that might try to get the validation results
   * during initial render. This is irrelevant for stateless mode.
   */
  if (
    ctxRef.operationMode === OPERATION_MODE_STATEFUL &&
    !getSuite(ctxRef.suiteId)
  ) {
    runWithContext(ctxRef, registerSuite);
  }

  // returns validator function
  // and sets the function name
  // to the name of the suite
  return Object.defineProperties(
    (...args) => {
      const output = runWithContext(ctxRef, context => {
        registerSuite();
        const { suiteId } = context;
        tests.apply(null, args);
        mergeExcludedTests(suiteId);

        return produce(getSuiteState(suiteId));
      });
      return output;
    },
    {
      name: {
        value: name,
      },
      get: {
        value: () => get(name),
      },
      reset: {
        value: () => reset(name),
      },
    }
  );
};

export default createSuite;
