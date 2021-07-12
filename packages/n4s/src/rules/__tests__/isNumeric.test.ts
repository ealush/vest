import { isNumeric } from 'isNumeric';

const NUMERICS = ['-10', '0', 0xff, '0xFF', '8e5', '3.1415', +10, '0144'];

const NON_NUMERICS = [
  '-0x42',
  '7.2acdgs',
  '',
  {},
  NaN,
  null,
  true,
  Infinity,
  undefined,
];

describe('Tests isNumeric rule', () => {
  it('Should return true for numeric values', () => {
    NUMERICS.forEach(value => expect(isNumeric(value)).toBe(true));
  });

  it('Should return false for non numeric values', () => {
    // @ts-expect-error - testing bad usage
    NON_NUMERICS.forEach(value => expect(isNumeric(value)).toBe(false));
  });
});
