import { TVestMock } from './TVestMock';

export default function mockThrowError() {
  const deferThrow = jest.fn<string, any>();
  jest.resetModules();
  jest.mock('vest-utils', () => ({
    ...jest.requireActual('vest-utils'),
    deferThrow,
  }));
  const vest = require('vest') as TVestMock;

  return {
    deferThrow,
    vest,
  };
}
