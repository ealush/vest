export default function mockThrowError() {
  const throwErrorDeferred = jest.fn();
  const throwError = jest.fn();
  jest.resetModules();
  jest.mock('throwError', () => ({
    throwErrorDeferred,
    default: throwError,
  }));
  const vest = require('vest');

  return {
    throwErrorDeferred,
    throwError,
    vest,
  };
}
