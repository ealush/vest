import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('isPositive (numeric)', () => {
  it('passes for positive numeric strings', () => {
    expect(isNumeric().isPositive().run('1').passes).toBe(true);
    expect(isNumeric().isPositive().run('42').passes).toBe(true);
    expect(isNumeric().isPositive().run('0.5').passes).toBe(true);
  });

  it('passes for positive numbers', () => {
    expect(isNumeric().isPositive().run(1).passes).toBe(true);
    expect(isNumeric().isPositive().run(42).passes).toBe(true);
    expect(isNumeric().isPositive().run(Infinity).passes).toBe(true);
  });

  it('fails for zero and negative values', () => {
    expect(isNumeric().isPositive().run('0').passes).toBe(false);
    expect(isNumeric().isPositive().run('-1').passes).toBe(false);
    expect(isNumeric().isPositive().run(-1).passes).toBe(false);
  });
});
