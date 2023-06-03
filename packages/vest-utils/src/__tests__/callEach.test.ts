import callEach from 'callEach';

describe('callEach', () => {
  it('should call all functions in the array', () => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();
    const mockFn3 = jest.fn();

    callEach([mockFn1, mockFn2, mockFn3]);

    expect(mockFn1).toHaveBeenCalled();
    expect(mockFn2).toHaveBeenCalled();
    expect(mockFn3).toHaveBeenCalled();
  });

  it('should not throw an error if the array is empty', () => {
    expect(() => callEach([])).not.toThrow();
  });
});
