import { isNumber } from '.';

describe('Tests isNumber rule', () => {
  it('Should return true for a number', () => {
    expect(isNumber(42)).toBe(true);
  });

  it('Should return true for a NaN', () => {
    expect(isNumber(NaN)).toBe(true);
  });

  it('Should return false a string', () => {
    expect(isNumber('1')).toBe(false);
  });

  it('Should return false an array', () => {
    expect(isNumber([1, 2, 3])).toBe(false);
  });
});
