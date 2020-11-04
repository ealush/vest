const { packageNames } = require('../../../util');

const mock = (moduleName, mockImplementation) => {
  const mockFn = jest.fn(mockImplementation);
  jest.resetModules();
  require(packageNames.VEST); // re-require vest for global assignments
  jest.mock(moduleName, () => ({
    __esModule: true,
    default: mockFn,
  }));
  return mockFn;
};

export default mock;
