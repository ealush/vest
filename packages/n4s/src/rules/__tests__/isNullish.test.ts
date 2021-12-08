import { enforce } from 'n4s';

describe('enforce.isNullish', () => {
  it('Should return true for `null` value', () => {
    expect(enforce.isNullish().test(null)).toBe(true);
  });

  it('Should return true for `undefined` value', () => {
    expect(enforce.isNullish().test(undefined)).toBe(true);
  });

  it.each([
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
    expect(enforce.isNullish().test(v)).toBe(false);
  });
});

describe('enforce.isNotNullish', () => {
  it('Should return false for `null` value', () => {
    expect(enforce.isNotNullish().test(null)).toBe(false);
  });

  it('Should return false for `undefined` value', () => {
    expect(enforce.isNotNullish().test(undefined)).toBe(false);
  });

  it.each([
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
  ])('Should return true for %s value', v => {
    expect(enforce.isNotNullish().test(v)).toBe(true);
  });
});
