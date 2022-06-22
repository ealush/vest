import { optionalFunctionValue } from 'vest-utils';

describe('optionalFunctionValue', () => {
  describe('When not a function', () => {
    it.each([0, undefined, false, true, 1, [], {}, null, NaN])(
      'Should return the same value',
      value => {
        expect(optionalFunctionValue(value)).toBe(value);
      }
    );
  });

  describe('When value is a function', () => {
    it('Should call the function and return its return value', () => {
      const value = jest.fn(() => 'return value');

      expect(optionalFunctionValue(value)).toBe('return value');
      expect(value).toHaveBeenCalled();
    });
    it('Should run with arguments arry', () => {
      const value = jest.fn((...args) => args.join('|'));
      const args = [1, 2, 3, 4];
      expect(optionalFunctionValue(value, ...args)).toBe('1|2|3|4');
      expect(value).toHaveBeenCalledWith(...args);
    });
  });
});
