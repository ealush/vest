import { isUndefined } from 'isUndefined';

describe('Tests isUndefined rule', () => {
  it('Should return true for `undefined` value', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined()).toBe(true);
  });

  it.each([
    null,
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
    () => undefined,
  ])('Should return false for %s value', v => {
    expect(isUndefined(v)).toBe(false);
  });
});
