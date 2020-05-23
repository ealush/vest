import { OPERATION_MODE_STATEFUL } from '../../constants';
import runWithContext from '../../lib/runWithContext';
import singleton from '../../lib/singleton';
import throwError from '../../lib/throwError';
import produce from '../produce';
import getSuiteState from '../state/getSuiteState';
import registerSuite from '../state/registerSuite';
import { mergeSkipped } from '../test/lib/skipped';
import runAsyncTest from '../test/runAsyncTest';
import { SUITE_INIT_ERROR } from './constants';

/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = (name, tests) => {
  if (typeof name !== 'string') {
    return throwError(
      SUITE_INIT_ERROR + ' Expected name to be a string.',
      TypeError
    );
  }

  if (typeof tests !== 'function') {
    return throwError(
      SUITE_INIT_ERROR + ' Expected tests to be a function.',
      TypeError
    );
  }

  // returns validator function
  return (...args) => {
    const parentContext = singleton.useContext() ?? {
      name,
      tests,
      suiteId: name,
      operationMode: OPERATION_MODE_STATEFUL,
    };

    const output = runWithContext(parentContext, context => {
      registerSuite();
      const { suiteId } = context;
      tests.apply(null, args);
      mergeSkipped(suiteId);

      [...getSuiteState(suiteId).pending].forEach(runAsyncTest);
      return produce(getSuiteState(suiteId));
    });

    return output;
  };
};

export default createSuite;
