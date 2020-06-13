import { OPERATION_MODE_STATEFUL } from '../../constants';
import runWithContext from '../../lib/runWithContext';
import singleton from '../../lib/singleton';
import validateSuiteParams from '../../lib/validateSuiteParams';
import produce from '../produce';
import { getSuite } from '../state';
import getSuiteState from '../state/getSuiteState';
import registerSuite from '../state/registerSuite';
import mergeExcludedTests from '../test/lib/mergeExcludedTests';
import runAsyncTest from '../test/runAsyncTest';

/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = (name, tests) => {
  validateSuiteParams('vest.create', name, tests);

  const ctx = singleton.useContext();

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
  return (...args) => {
    const output = runWithContext(ctxRef, context => {
      registerSuite();
      const { suiteId } = context;
      tests.apply(null, args);
      mergeExcludedTests(suiteId);

      [...getSuiteState(suiteId).pending].forEach(runAsyncTest);
      return produce(getSuiteState(suiteId));
    });
    return output;
  };
};

export default createSuite;
