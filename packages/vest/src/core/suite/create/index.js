import { OPERATION_MODE_STATEFUL } from '../../../constants';
import { get } from '../../../hooks';
import validateSuiteParams from '../../../lib/validateSuiteParams';
import context from '../../context';
import produce from '../../produce';
import mergeExcludedTests from '../../test/lib/mergeExcludedTests';
import getState from '../getState';
import getSuite from '../getSuite';
import register from '../register';
import reset from '../reset';

/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = (name, tests) => {
  validateSuiteParams('vest.create', name, tests);

  const ctx = context.use();

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
    context.run(ctxRef, register);
  }

  // returns validator function
  // and sets the function name
  // to the name of the suite
  return Object.defineProperties(
    (...args) => {
      const output = context.run(ctxRef, context => {
        register();
        const { suiteId } = context;
        tests.apply(null, args);
        mergeExcludedTests(suiteId);

        return produce(getState(suiteId));
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
