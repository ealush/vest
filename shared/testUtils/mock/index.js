const path = require('path');
const { PACKAGE_VEST } = require('../../../shared/constants');
const packagePath = require('../../../util/packagePath');

const vestSrc = packagePath(PACKAGE_VEST, 'src');

const PATHS = {
  context: path.join(vestSrc, 'core/context'),
  createSuite: path.join(vestSrc, 'core/suite/create'),
  id: path.join(vestSrc, 'lib/id'),
  patch: path.join(vestSrc, 'core/state/patch'),
  throwError: path.join(vestSrc, 'lib/throwError'),
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
