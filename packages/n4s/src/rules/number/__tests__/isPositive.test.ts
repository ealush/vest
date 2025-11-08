import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isPositive', () => {
  it('pass for positive numbers', () => {
    expect(enforce.isNumber().isPositive().run(1).pass).toBe(true);
    expect(enforce.isNumber().isPositive().run(42).pass).toBe(true);
    expect(enforce.isNumber().isPositive().run(Infinity).pass).toBe(true);
    expect(enforce.isNumber().isPositive().run(0.1).pass).toBe(true);
  });

  it('fails for zero and negative numbers', () => {
    expect(enforce.isNumber().isPositive().run(0).pass).toBe(false);
    expect(enforce.isNumber().isPositive().run(-1).pass).toBe(false);
    expect(enforce.isNumber().isPositive().run(-42).pass).toBe(false);
    expect(enforce.isNumber().isPositive().run(-Infinity).pass).toBe(false);
  });
});
