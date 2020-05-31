const packagePath = require('../../../../util/packagePath');

const PATHS = {
  Context: 'core/Context',
  cleanupCompletedSuite: 'core/state/cleanupCompletedSuite',
  createSuite: 'core/createSuite',
  id: 'lib/id',
  patch: 'core/state/patch',
  runWithContext: 'lib/runWithContext',
  throwError: 'lib/throwError',
  validateSuiteParams: 'lib/validateSuiteParams',
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
