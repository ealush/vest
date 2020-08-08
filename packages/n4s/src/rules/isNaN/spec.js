import _isNaN from '.';

describe('Tests isNaN rule', () => {
  it('Should return true for `NaN` value', () => {
    expect(_isNaN(NaN)).toBe(true);
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
    expect(_isNaN(v)).toBe(false);
  });

  it('Should expose negativeForm property', () => {
    expect(_isNaN.negativeForm).toBe('isNotNaN');
  });
});
