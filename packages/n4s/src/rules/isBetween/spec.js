import { isBetween } from '.';

describe('Tests isBetween rule', () => {
  it('Should return true for 5 between 0 and 10', () => {
    expect(isBetween(5, 0, 10)).toBe(true);
  });

  it('Should return true for 5 between 4 and 6', () => {
    expect(isBetween(5, 4, 6)).toBe(true);
  });

  it('Should return true for 5 not between 5 and 6', () => {
    expect(isBetween(5, 5, 6)).toBe(true);
  });

  it('Should return true -5 between -5 and -6', () => {
    expect(isBetween(-5, -6, -5)).toBe(true);
  });

  it('Should return true for -5 between -1 and -10', () => {
    expect(isBetween(-5, -10, -1)).toBe(true);
  });

  it('Should return true for 5 between 5 and 5', () => {
    expect(isBetween(5, 5, 5)).toBe(true);
  });

  it('Should return false for bad type for value', () => {
    expect(isBetween('string', 5, 10)).toBe(false);
  });

  it('Should return false for bad type for min', () => {
    expect(isBetween(5, 'string', 10)).toBe(false);
  });

  it('Should return false for bad type for max', () => {
    expect(isBetween(5, 4, 'string')).toBe(false);
  });
});
