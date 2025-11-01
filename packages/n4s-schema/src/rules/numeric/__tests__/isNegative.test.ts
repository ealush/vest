import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNegative (numeric)', () => {
  it('passes for negative numeric strings', () => {
    expect(enforceLazy.isNumeric().isNegative().run('-1').passes).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run('-42').passes).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run('-0.5').passes).toBe(true);
  });

  it('passes for negative numbers', () => {
    expect(enforceLazy.isNumeric().isNegative().run(-1).passes).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run(-42).passes).toBe(true);
    expect(enforceLazy.isNumeric().isNegative().run(-Infinity).passes).toBe(true);
  });

  it('fails for positive values and zero', () => {
    expect(enforceLazy.isNumeric().isNegative().run('0').passes).toBe(false);
    expect(enforceLazy.isNumeric().isNegative().run('1').passes).toBe(false);
    expect(enforceLazy.isNumeric().isNegative().run(1).passes).toBe(false);
  });
});
