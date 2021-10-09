import { isBlank, isNotBlank } from 'isBlank';

describe('isBlank', () => {
  it('Should return true for a string of white spaces', () => {
    expect(isBlank('   ')).toBe(true);
  });

  it('Should return false for a string with at least a non-whitespace', () => {
    expect(isBlank('not blank')).toBe(false);
  });
});

describe('isNotBlank', () => {
  it('Should return false for a string of white spaces', () => {
    expect(isNotBlank('   ')).toBe(false);
  });

  it('Should return true for a string with at least a non-whitespace', () => {
    expect(isNotBlank('not blank')).toBe(true);
  });
});
