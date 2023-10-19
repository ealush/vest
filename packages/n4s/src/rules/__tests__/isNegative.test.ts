import { isNegative } from 'isNegative';

describe('Tests isNegative rule', () => {
  it('Should return false for zero', () => {
    expect(isNegative(0)).toBe(false);
  });
  describe('When argument is a negative number', () => {
    it('Should return true for negative number', () => {
      expect(isNegative(-1)).toBe(true);
    });
    it('should return true for negative desimal number', () => {
      expect(isNegative(-1.1)).toBe(true);
    });
    it('should return true for negative string number', () => {
      expect(isNegative('-1')).toBe(true);
    });
    it('should return true for negative decimal string number', () => {
      expect(isNegative('-1.10')).toBe(true);
    });
  });
  describe('When argument is a positive number', () => {
    it('should return false for positive number', () => {
      expect(isNegative(10)).toBe(false);
    });
    it('should return false for positive desimal number', () => {
      expect(isNegative(10.1)).toBe(false);
    });
    it('should return false for positive string number', () => {
      expect(isNegative('10')).toBe(false);
    });
  });

  describe('When argument is undefined or null or string', () => {
    it('should return false for undefined value', () => {
      // @ts-expect-error - testing bad usage
      expect(isNegative()).toBe(false);
    });
    it('should return false for null value', () => {
      // @ts-expect-error - testing bad usage
      expect(isNegative(null)).toBe(false);
    });
  });
});
