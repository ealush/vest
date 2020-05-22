const packagePath = require('../../../../util/packagePath');

const PATHS = {
  Context: 'core/Context',
  createSuite: 'core/createSuite',
  runWithContext: 'lib/runWithContext',
  throwError: 'lib/throwError',
  id: 'lib/id',
  cleanupCompletedSuite: 'core/state/cleanupCompletedSuite',
  patch: 'core/state/patch',
};

const mock = (moduleName, mockImplementation) => {
  const mockFn = jest.fn(mockImplementation);
  jest.resetModules();
  jest.mock(packagePath('vest/src', PATHS[moduleName]), () => ({
    __esModule: true,
    default: mockFn,
  }));
  return mockFn;
};

export default mock;
