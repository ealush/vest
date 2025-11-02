import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNegative (numeric)', () => {
  it('pass for negative numeric strings', () => {
    expect(enforceLazy.isNumeric().isNegative().run('-1').pass).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run('-42').pass).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run('-0.5').pass).toBe(true);
  });

  it('pass for negative numbers', () => {
    expect(enforceLazy.isNumeric().isNegative().run(-1).pass).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run(-42).pass).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run(-Infinity).pass).toBe(true);
  });

  it('fails for positive values and zero', () => {
    expect(enforceLazy.isNumeric().isNegative().run('0').pass).toBe(false);
    expect(enforceLazy.isNumeric().isNegative().run('1').pass).toBe(false);
    expect(enforceLazy.isNumeric().isNegative().run(1).pass).toBe(false);
  });
});
