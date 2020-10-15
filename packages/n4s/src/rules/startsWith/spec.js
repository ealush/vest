import { startsWith } from '.';

describe('Tests isArray rule', () => {
  const word = 'meow';
  const totallyDifferentWord = 'lorem';
  it('Should return true for the same word', () => {
    expect(startsWith(word, word)).toBe(true);
  });

  it('Should return true for a prefix', () => {
    expect(startsWith(word, word.substring(0, word.length / 2))).toBe(true);
  });

  it('Should return true for empty prefix', () => {
    expect(startsWith(word, '')).toBe(true);
  });

  it('Should return false for a wrong prefix', () => {
    expect(startsWith(word, word.substring(1, word.length - 1))).toBe(false);
  });

  it('Should return false for a prefix which is a totally different word', () => {
    expect(startsWith(word, totallyDifferentWord)).toBe(false);
  });

  it('Should return false for a prefix longer than the word', () => {
    expect(startsWith(word, word.repeat(2))).toBe(false);
  });
});
