import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNegative', () => {
  it('pass for negative numbers', () => {
    expect(enforceLazy.isNumber().isNegative().run(-1).pass).toBe(true);
    expect(enforceLazy.isNumber().isNegative().run(-42).pass).toBe(true);
    expect(enforceLazy.isNumber().isNegative().run(-Infinity).pass).toBe(true);
    expect(enforceLazy.isNumber().isNegative().run(-0.1).pass).toBe(true);
  });

  it('fails for positive numbers and zero', () => {
    expect(enforceLazy.isNumber().isNegative().run(0).pass).toBe(false);
    expect(enforceLazy.isNumber().isNegative().run(1).pass).toBe(false);
    expect(enforceLazy.isNumber().isNegative().run(42).pass).toBe(false);
    expect(enforceLazy.isNumber().isNegative().run(Infinity).pass).toBe(false);
  });
});
