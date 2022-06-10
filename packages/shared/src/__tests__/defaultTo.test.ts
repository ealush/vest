import defaultTo from 'defaultTo';

describe('defaultTo', () => {
  describe('When value is a function', () => {
    it('Should call the function', () => {
      const value = jest.fn(() => 'return value');

      expect(defaultTo(value, 'fallback value')).toBe('return value');
      expect(value).toHaveBeenCalled();
    });
    describe('When value is nullish', () => {
      it('Should return fallback value', () => {
        expect(defaultTo(null, 'fallback value')).toBe('fallback value');
        expect(defaultTo(undefined, 'fallback value')).toBe('fallback value');
      });
    });

    describe('When value is not nullish', () => {
      it('Should use value', () => {
        expect(defaultTo('value', 'fallback value')).toBe('value');
      });
    });
  });

  describe('When value is not a function', () => {
    describe('When the value is nullish', () => {
      it('Should return fallback value', () => {
        expect(defaultTo(null, 'fallback value')).toBe('fallback value');
        expect(defaultTo(undefined, 'fallback value')).toBe('fallback value');
      });
    });
    describe('When the value is not nullish', () => {
      it.each([0, false, true, 1, [], {}, NaN])(
        'Should return the same value',
        value => {
          expect(defaultTo(value, 'fallback value')).toBe(value);
        }
      );
    });
  });

  describe('When the fallback value is a function', () => {
    it('Should call the function and return its return value', () => {
      const fallbackValue = jest.fn(() => 'fallback value');

      expect(defaultTo(null, fallbackValue)).toBe('fallback value');
      expect(fallbackValue).toHaveBeenCalled();
    });
  });
});
