export default function mockThrowError() {
  const deferThrow = jest.fn();
  jest.resetModules();
  jest.mock('throwError', () => ({
    deferThrow,
  }));
  const vest = require('vest');

  return {
    deferThrow,
    vest,
  };
}
