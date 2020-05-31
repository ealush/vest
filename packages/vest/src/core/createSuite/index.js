import { OPERATION_MODE_STATEFUL } from '../../constants';
import runWithContext from '../../lib/runWithContext';
import singleton from '../../lib/singleton';
import validateSuiteParams from '../../lib/validateSuiteParams';
import produce from '../produce';
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

  // returns validator function
  return (...args) => {
    const shouldCreateId = !singleton.useContext()?.suiteId;

    const ctxRef = singleton.useContext() ?? {
      name,
      operationMode: OPERATION_MODE_STATEFUL,
      tests,
      ...(shouldCreateId && {
        suiteId: name,
      }),
    };

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
