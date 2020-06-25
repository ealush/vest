import throwError from '../throwError/index';

const throwSuiteParamError = (
  functionName: string,
  param: string,
  expected: string
) =>
  throwError(
    `Wrong arguments passed to \`${functionName}\` function. Expected ${param} to be a ${expected}.`,
    TypeError
  );

/**
 * Validates suite and group initialization parameters.
 */
const validateSuiteParams = (
  functionName: string,
  name: string,
  tests: () => void
): void => {
  if (typeof name !== 'string') {
    throwSuiteParamError(functionName, 'name', 'string');
  }

  if (typeof tests !== 'function') {
    throwSuiteParamError(functionName, 'tests', 'function');
  }
};

export default validateSuiteParams;
