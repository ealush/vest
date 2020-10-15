import { isString } from '.';

describe('Tests isString rule', () => {
  it('Should return false for a number', () => {
    expect(isString(42)).toBe(false);
  });

  it('Should return false for an array', () => {
    expect(isString([])).toBe(false);
  });

  it('Should return true a string', () => {
    expect(isString('I love you')).toBe(true);
  });
});
