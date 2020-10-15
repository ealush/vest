import { endsWith } from '.';

describe('Tests isArray rule', () => {
  const word = 'meow';
  const totallyDifferentWord = 'lorem';
  it('Should return true for the same word', () => {
    expect(endsWith(word, word)).toBe(true);
  });

  it('Should return true for a suffix', () => {
    expect(endsWith(word, word.substring(word.length / 2, word.length))).toBe(
      true
    );
  });

  it('Should return true for empty suffix', () => {
    expect(endsWith(word, '')).toBe(true);
  });

  it('Should return false for a wrong suffix', () => {
    expect(endsWith(word, word.substring(0, word.length - 1))).toBe(false);
  });

  it('Should return false for a suffix which is a totally different word', () => {
    expect(endsWith(word, totallyDifferentWord)).toBe(false);
  });

  it('Should return false for a suffix longer than the word', () => {
    expect(endsWith(word, word.repeat(2))).toBe(false);
  });
});
