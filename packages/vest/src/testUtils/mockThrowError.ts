import { TVestMock } from './TVestMock';

export default function mockThrowError() {
  const deferThrow = vi.fn();
  vi.resetModules();
  vi.mock('vest-utils', () => ({
    ...vi.importActual('vest-utils'),
    deferThrow,
  }));
  const vest = require('vest') as TVestMock;

  return {
    deferThrow,
    vest,
  };
}
