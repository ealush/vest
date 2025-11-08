import callEach from 'callEach';
import { describe, it, expect, vi } from 'vitest';

describe('callEach', () => {
  it('should call all functions in the array', () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    const mockFn3 = vi.fn();

    callEach([mockFn1, mockFn2, mockFn3]);

    expect(mockFn1).toHaveBeenCalled();
    expect(mockFn2).toHaveBeenCalled();
    expect(mockFn3).toHaveBeenCalled();
  });

  it('should not throw an error if the array is empty', () => {
    expect(() => callEach([])).not.toThrow();
  });
});
