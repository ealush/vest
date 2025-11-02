import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('between (numeric)', () => {
  it('pass when numeric string is between', () => {
    expect(enforceLazy.isNumeric().isBetween(0, 10).run('5').pass).toBe(true);
    expect(enforceLazy.isNumeric().isBetween(0, 10).run('0').pass).toBe(true);
    expect(enforceLazy.isNumeric().isBetween(0, 10).run('10').pass).toBe(true);
    expect(enforceLazy.isNumeric().isBetween(-5, 5).run('0').pass).toBe(true);
  });

  it('pass when number is between', () => {
    expect(enforceLazy.isNumeric().isBetween(0, 10).run(5).pass).toBe(true);
  });

  it('fails when value is outside range', () => {
    expect(enforceLazy.isNumeric().isBetween(0, 10).run('-1').pass).toBe(false);
    expect(enforceLazy.isNumeric().isBetween(0, 10).run('11').pass).toBe(false);
    expect(enforceLazy.isNumeric().isBetween(5, 10).run(4).pass).toBe(false);
  });
});
