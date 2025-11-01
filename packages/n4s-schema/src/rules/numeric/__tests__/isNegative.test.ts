import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('isNegative (numeric)', () => {
  it('passes for negative numeric strings', () => {
    expect(isNumeric().isNegative().run('-1').passes).toBe(true);
    expect(isNumeric().isNegative().run('-42').passes).toBe(true);
    expect(isNumeric().isNegative().run('-0.5').passes).toBe(true);
  });

  it('passes for negative numbers', () => {
    expect(isNumeric().isNegative().run(-1).passes).toBe(true);
    expect(isNumeric().isNegative().run(-42).passes).toBe(true);
    expect(isNumeric().isNegative().run(-Infinity).passes).toBe(true);
  });

  it('fails for positive values and zero', () => {
    expect(isNumeric().isNegative().run('0').passes).toBe(false);
    expect(isNumeric().isNegative().run('1').passes).toBe(false);
    expect(isNumeric().isNegative().run(1).passes).toBe(false);
  });
});
