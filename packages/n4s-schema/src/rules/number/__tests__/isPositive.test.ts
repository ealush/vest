import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isPositive', () => {
  it('pass for positive numbers', () => {
    expect(enforceLazy.isNumber().isPositive().run(1).pass).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(42).pass).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(Infinity).pass).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(0.1).pass).toBe(true);
  });

  it('fails for zero and negative numbers', () => {
    expect(enforceLazy.isNumber().isPositive().run(0).pass).toBe(false);
    expect(enforceLazy.isNumber().isPositive().run(-1).pass).toBe(false);
    expect(enforceLazy.isNumber().isPositive().run(-42).pass).toBe(false);
    expect(enforceLazy.isNumber().isPositive().run(-Infinity).pass).toBe(false);
  });
});
