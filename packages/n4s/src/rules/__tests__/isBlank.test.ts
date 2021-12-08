import { isBlank, isNotBlank } from 'isBlank';

describe('isBlank', () => {
  it('Should return true for a string of white spaces', () => {
    expect(isBlank('   ')).toBe(true);
  });

  it('Should return false for a string with at least a non-whitespace', () => {
    expect(isBlank('not blank')).toBe(false);
  });

  it('Should return true for undefined', () => {
    expect(isBlank(undefined)).toBeTruthy();
  });

  it('Should return true for null', () => {
    expect(isBlank(null)).toBeTruthy();
  });
});

describe('isNotBlank', () => {
  it('Should return false for a string of white spaces', () => {
    expect(isNotBlank('   ')).toBe(false);
  });

  it('Should return true for a string with at least a non-whitespace', () => {
    expect(isNotBlank('not blank')).toBe(true);
  });

  it('Should return false for undefined', () => {
    expect(isNotBlank(undefined)).toBeFalsy();
  });

  it('Should return false for null', () => {
    expect(isNotBlank(null)).toBeFalsy();
  });
});
