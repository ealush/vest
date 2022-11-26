export default function mockThrowError() {
  const deferThrow = jest.fn();
  jest.resetModules();
  jest.mock('vest-utils', () => ({
    ...jest.requireActual('vest-utils'),
    deferThrow,
  }));
  const vest = require('vest');

  return {
    deferThrow,
    vest,
  };
}
