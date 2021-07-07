const mock = (
  moduleName: string,
  mockImplementation?: (...args: any[]) => any
) => {
  const mockFn = jest.fn(mockImplementation);
  jest.resetModules();
  jest.mock(moduleName, () => ({
    __esModule: true,
    default: mockFn,
  }));
  return mockFn;
};

export default mock;
