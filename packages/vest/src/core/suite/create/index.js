import throwError from '../../../lib/throwError';
import context from '../../context';
import produce from '../../produce';
import createState from '../../state';
import mergeExcludedTests from '../../test/lib/mergeExcludedTests';

/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Identifier for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Function} validator function.
 */
const createSuite = (...args) => {
  const { length: l, [l - 2]: name, [l - 1]: tests } = args;

  if (typeof tests !== 'function') {
    throwError(
      'Suite initialization error. Expected `tests` to be a function.'
    );
  }

  const stateRef = createState(name);

  return Object.defineProperties(
    (...args) => {
      const output = context.run({ name, stateRef }, () => {
        stateRef.registerValidation();
        tests.apply(null, args);
        mergeExcludedTests();

        return produce(stateRef);
      });
      return output;
    },
    {
      get: { value: () => produce(stateRef, { draft: true }) },
      name: { value: 'validate' },
      reset: { value: () => stateRef.reset() },
    }
  );
};

export default createSuite;
