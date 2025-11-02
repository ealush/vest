import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isOdd (numeric)', () => {
  it('pass for odd numeric strings', () => {
    expect(enforceLazy.isNumeric().isOdd().run('1').pass).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run('3').pass).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run('99').pass).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run('-1').pass).toBe(true);
  });

  it('pass for odd numbers', () => {
    expect(enforceLazy.isNumeric().isOdd().run(1).pass).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run(3).pass).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run(99).pass).toBe(true);
  });

  it('fails for even values', () => {
    expect(enforceLazy.isNumeric().isOdd().run('0').pass).toBe(false);
    expect(enforceLazy.isNumeric().isOdd().run('2').pass).toBe(false);
    expect(enforceLazy.isNumeric().isOdd().run(2).pass).toBe(false);
  });
});
