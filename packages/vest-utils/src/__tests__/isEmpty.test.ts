import { isEmpty } from 'vest-utils';

describe('Tests isEmpty rule', () => {
  describe('Expect true', () => {
    it('Should return false for a non-empty array', () => {
      expect(isEmpty([1, 2, 3, 4, 5, 6])).toBe(false);
    });

    it('Should return true for an empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('Should return false for a non-empty objecd', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    it('Should return true for an empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('Should return true for an empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('Should return false for a non empty string', () => {
      expect(isEmpty('hey')).toBe(false);
    });

    it('Should return true for zero', () => {
      expect(isEmpty(0)).toBe(true);
    });

    it('Should return false for one', () => {
      expect(isEmpty(1)).toBe(false);
    });

    it('Should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('Should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('Should return true for NaN', () => {
      expect(isEmpty(NaN)).toBe(true);
    });

    it('Should return false for a Symbol', () => {
      expect(isEmpty(Symbol('hey'))).toBe(false);
    });
  });
});
