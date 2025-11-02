import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isPositive (numeric)', () => {
  it('pass for positive numeric strings', () => {
    expect(enforceLazy.isNumeric().isPositive().run('1').pass).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run('42').pass).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run('0.5').pass).toBe(true);
  });

  it('pass for positive numbers', () => {
    expect(enforceLazy.isNumeric().isPositive().run(1).pass).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run(42).pass).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run(Infinity).pass).toBe(true);
  });

  it('fails for zero and negative values', () => {
    expect(enforceLazy.isNumeric().isPositive().run('0').pass).toBe(false);
    expect(enforceLazy.isNumeric().isPositive().run('-1').pass).toBe(false);
    expect(enforceLazy.isNumeric().isPositive().run(-1).pass).toBe(false);
  });
});
