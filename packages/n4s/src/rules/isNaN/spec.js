import * as NaNRule from '.';

describe('Tests isNaN rule', () => {
  it('Should return true for `NaN` value', () => {
    expect(NaNRule.isNaN(NaN)).toBe(true);
  });

  it.each([
    undefined,
    null,
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
  ])('Should return false for %s value', v => {
    expect(NaNRule.isNaN(v)).toBe(false);
  });
});
