import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isPositive (numeric)', () => {
  it('passes for positive numeric strings', () => {
    expect(enforceLazy.isNumeric().isPositive().run('1').passes).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run('42').passes).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run('0.5').passes).toBe(true);
  });

  it('passes for positive numbers', () => {
    expect(enforceLazy.isNumeric().isPositive().run(1).passes).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run(42).passes).toBe(true);
    expect(enforceLazy.isNumeric().isPositive().run(Infinity).passes).toBe(
      true,
    );
  });

  it('fails for zero and negative values', () => {
    expect(enforceLazy.isNumeric().isPositive().run('0').passes).toBe(false);
    expect(enforceLazy.isNumeric().isPositive().run('-1').passes).toBe(false);
    expect(enforceLazy.isNumeric().isPositive().run(-1).passes).toBe(false);
  });
});
