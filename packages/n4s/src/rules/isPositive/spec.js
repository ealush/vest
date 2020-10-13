import isPositive from '.';

describe.only('Tests isPositive rule', () => {
  describe('First argument is positive', () => {
    describe('When first argument positive number', () => {
      it('Should return true for positive numer', () => {
        expect(isPositive(1)).toBe(true);
      });
      it('should return true for positive desimal number', () => {
        expect(isPositive(1.1)).toBe(true);
      });
      it('should return true for positive string number', () => {
        expect(isPositive('1')).toBe(true);
      });
      it('should return true for positive decimal string number', () => {
        expect(isPositive('1.120')).toBe(true);
      });
    });
    describe('When argument negative number', () => {
      it('should return false for negative number', () => {
        expect(isPositive(-10)).toBe(false);
      });
      it('should return false for negative desimal number', () => {
        expect(isPositive(-10.1)).toBe(false);
      });
      it('should return false for negative string number', () => {
        expect(isPositive('-10')).toBe(false);
      });
    });

    describe('When argument undefined or null or string', () => {
      it('should return false for undefined value', () => {
        expect(isPositive()).toBe(false);
      });
      it('should return false for null value', () => {
        expect(isPositive(null)).toBe(false);
      });
    });
  });
});
