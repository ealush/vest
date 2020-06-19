const path = require('path');
const { PACKAGE_VEST } = require('../../../shared/constants');
const packagePath = require('../../../util/packagePath');

const vestSrc = packagePath(PACKAGE_VEST, 'src');

const PATHS = {
  Context: path.join(vestSrc, 'core/Context'),
  cleanupCompletedSuite: path.join(vestSrc, 'core/state/cleanupCompletedSuite'),
  createSuite: path.join(vestSrc, 'core/createSuite'),
  id: path.join(vestSrc, 'lib/id'),
  patch: path.join(vestSrc, 'core/state/patch'),
  runWithContext: path.join(vestSrc, 'lib/runWithContext'),
  throwError: path.join(vestSrc, 'lib/throwError'),
  validateSuiteParams: path.join(vestSrc, 'lib/validateSuiteParams'),
};

const mock = (moduleName, mockImplementation) => {
  const mockFn = jest.fn(mockImplementation);
  jest.resetModules();
  require(vestSrc); // re-require vest for global assignments
  jest.mock(PATHS[moduleName], () => ({
    __esModule: true,
    default: mockFn,
  }));
  return mockFn;
};

export default mock;
