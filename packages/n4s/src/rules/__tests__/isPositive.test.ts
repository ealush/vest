import { isPositive } from 'vest-utils';

describe('Test isPositive rule', () => {
  it('Should return false for zero', () => {
    expect(isPositive(0)).toBe(false);
  });

  describe('When argument is a positive number', () => {
    it('Should return true for positive number', () => {
      expect(isPositive(10)).toBe(true);
    });
    it('should return true for positive desimal number', () => {
      expect(isPositive(10.1)).toBe(true);
    });
    it('should return true for positive string number', () => {
      expect(isPositive('10')).toBe(true);
    });
    it('should return true for positive decimal string number', () => {
      expect(isPositive('10.10')).toBe(true);
    });
  });

  describe('When argument is a negative number', () => {
    it('Should return false for negative numer', () => {
      expect(isPositive(-1)).toBe(false);
    });
    it('should return false for negative desimal number', () => {
      expect(isPositive(-1.1)).toBe(false);
    });
    it('should return false for negative string number', () => {
      expect(isPositive('-1')).toBe(false);
    });
    it('should return false for negative decimal string number', () => {
      expect(isPositive('-1.10')).toBe(false);
    });
  });
});
