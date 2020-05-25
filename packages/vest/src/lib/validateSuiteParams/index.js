import throwError from '../throwError/index';

const throwSuiteParamError = (functionName, param, expected) =>
  throwError(
    `Wrong arguments passed to \`${functionName}\` function. Expected ${param} to be a ${expected}.`,
    TypeError
  );

/**
 * Validates suite and group initialization parameters.
 * @param {string} functionName   Name of the function that called `validateSuiteParams`.
 * @param {string} name           Suite or group name.
 * @param {Function} tests        Tests callback.
 */
const validateSuiteParams = (functionName, name, tests) => {
  if (typeof name !== 'string') {
    throwSuiteParamError(functionName, 'name', 'string');
  }

  if (typeof tests !== 'function') {
    throwSuiteParamError(functionName, 'tests', 'function');
  }
};

export default validateSuiteParams;
