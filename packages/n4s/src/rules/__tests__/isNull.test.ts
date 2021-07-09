import { isNull } from 'isNull';

describe('Tests isNull rule', () => {
  it('Should return true for `null` value', () => {
    expect(isNull(null)).toBe(true);
  });

  it.each([
    undefined,
    NaN,
    false,
    true,
    Object,
    Array(0),
    '',
    ' ',
    0,
    1,
    '0',
    '1',
    Function.prototype,
  ])('Should return false for %s value', v => {
    expect(isNull(v)).toBe(false);
  });
});
