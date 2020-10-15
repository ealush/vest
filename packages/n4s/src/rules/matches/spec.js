import { matches } from '.';

const URL = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.(?=.*[a-z]){1,24}\b([-a-zA-Z0-9@:%_+.~#?&//=()]*)/,
  LENGTH = /^[a-zA-Z]{3,7}$/,
  NUMBERS = '[0-9]';

describe('Tests matches rule', () => {
  it('Should return true for a matching regex', () => {
    expect(matches('https://google.com', URL)).toBe(true);
    expect(matches('github.com', URL)).toBe(true);
    expect(matches('ealush', LENGTH)).toBe(true);
  });

  it('Should return false for a non matching regex', () => {
    expect(matches('google', URL)).toBe(false);
    expect(matches('Minimum1', LENGTH)).toBe(false);
  });

  it('Should convert string to regex and return true', () => {
    expect(matches('9675309', NUMBERS)).toBe(true);
    expect(matches('Minimum1', NUMBERS)).toBe(true);
  });

  it('Should convert string to regex and return false', () => {
    expect(matches('no-match', NUMBERS)).toBe(false);
    expect(matches('Minimum', NUMBERS)).toBe(false);
  });

  it('Should return false if a valid RegExp nor a string were given', () => {
    expect(matches('no-match', {})).toBe(false);
    expect(matches('no-match')).toBe(false);
    expect(matches('no-match', null)).toBe(false);
    expect(matches('no-match', 11)).toBe(false);
  });
});
