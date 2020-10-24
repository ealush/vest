const { packagePath, packageNames } = require('../../../util');

const vestSrc = packagePath(packageNames.VEST, 'src');

const mock = (moduleName, mockImplementation) => {
  const mockFn = jest.fn(mockImplementation);
  jest.resetModules();
  require(vestSrc); // re-require vest for global assignments
  jest.mock(moduleName, () => ({
    __esModule: true,
    default: mockFn,
  }));
  return mockFn;
};

export default mock;
