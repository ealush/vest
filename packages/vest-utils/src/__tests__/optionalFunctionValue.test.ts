import { describe, it, expect, vi } from 'vitest';

import { dynamicValue } from '../vest-utils';

describe('dynamicValue', () => {
  describe('When not a function', () => {
    it.each([0, undefined, false, true, 1, [], {}, null, NaN])(
      'Should return the same value',
      value => {
        expect(dynamicValue(value)).toBe(value);
      },
    );
  });

  describe('When value is a function', () => {
    it('Should call the function and return its return value', () => {
      const value = vi.fn(() => 'return value');

      expect(dynamicValue(value)).toBe('return value');
      expect(value).toHaveBeenCalled();
    });
    it('Should run with arguments array', () => {
      const value = vi.fn((...args) => args.join('|'));
      const args = [1, 2, 3, 4];
      expect(dynamicValue(value, ...args)).toBe('1|2|3|4');
      expect(value).toHaveBeenCalledWith(...args);
    });
  });
});
