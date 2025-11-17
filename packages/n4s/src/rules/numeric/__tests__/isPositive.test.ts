import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isPositive (numeric)', () => {
  it('pass for positive numeric strings', () => {
    expect(enforce.isNumeric().isPositive().run('1').pass).toBe(true);
    expect(enforce.isNumeric().isPositive().run('42').pass).toBe(true);
    expect(enforce.isNumeric().isPositive().run('0.5').pass).toBe(true);
  });

  it('pass for positive numbers', () => {
    expect(enforce.isNumeric().isPositive().run(1).pass).toBe(true);
    expect(enforce.isNumeric().isPositive().run(42).pass).toBe(true);
    expect(enforce.isNumeric().isPositive().run(Infinity).pass).toBe(true);
  });

  it('fails for zero and negative values', () => {
    expect(enforce.isNumeric().isPositive().run('0').pass).toBe(false);
    expect(enforce.isNumeric().isPositive().run('-1').pass).toBe(false);
    expect(enforce.isNumeric().isPositive().run(-1).pass).toBe(false);
  });
});
