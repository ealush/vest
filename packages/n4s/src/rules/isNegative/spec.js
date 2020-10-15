import { isNegative } from '.';

describe('Tests isNegative rule', () => {
  describe('First argument is negative', () => {
    describe('When first argument negative number', () => {
      it('Should return true for negative numer', () => {
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
    describe('When argument positive number', () => {
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

    describe('When argument undefined or null or string', () => {
      it('should return false for undefined value', () => {
        expect(isNegative()).toBe(false);
      });
      it('should return false for null value', () => {
        expect(isNegative(null)).toBe(false);
      });
    });
  });
});
