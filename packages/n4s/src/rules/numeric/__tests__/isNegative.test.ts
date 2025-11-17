import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isNegative (numeric)', () => {
  it('pass for negative numeric strings', () => {
    expect(enforce.isNumeric().isNegative().run('-1').pass).toBe(true);
    expect(enforce.isNumeric().isNegative().run('-42').pass).toBe(true);
    expect(enforce.isNumeric().isNegative().run('-0.5').pass).toBe(true);
  });

  it('pass for negative numbers', () => {
    expect(enforce.isNumeric().isNegative().run(-1).pass).toBe(true);
    expect(enforce.isNumeric().isNegative().run(-42).pass).toBe(true);
    expect(enforce.isNumeric().isNegative().run(-Infinity).pass).toBe(true);
  });

  it('fails for positive values and zero', () => {
    expect(enforce.isNumeric().isNegative().run('0').pass).toBe(false);
    expect(enforce.isNumeric().isNegative().run('1').pass).toBe(false);
    expect(enforce.isNumeric().isNegative().run(1).pass).toBe(false);
  });
});
