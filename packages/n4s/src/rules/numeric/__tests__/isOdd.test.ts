import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isOdd (numeric)', () => {
  it('pass for odd numeric strings', () => {
    expect(enforce.isNumeric().isOdd().run('1').pass).toBe(true);
    expect(enforce.isNumeric().isOdd().run('3').pass).toBe(true);
    expect(enforce.isNumeric().isOdd().run('99').pass).toBe(true);
    expect(enforce.isNumeric().isOdd().run('-1').pass).toBe(true);
  });

  it('pass for odd numbers', () => {
    expect(enforce.isNumeric().isOdd().run(1).pass).toBe(true);
    expect(enforce.isNumeric().isOdd().run(3).pass).toBe(true);
    expect(enforce.isNumeric().isOdd().run(99).pass).toBe(true);
  });

  it('fails for even values', () => {
    expect(enforce.isNumeric().isOdd().run('0').pass).toBe(false);
    expect(enforce.isNumeric().isOdd().run('2').pass).toBe(false);
    expect(enforce.isNumeric().isOdd().run(2).pass).toBe(false);
  });
});
