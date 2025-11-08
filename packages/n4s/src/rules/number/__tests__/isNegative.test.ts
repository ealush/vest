import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isNegative', () => {
  it('pass for negative numbers', () => {
    expect(enforce.isNumber().isNegative().run(-1).pass).toBe(true);
    expect(enforce.isNumber().isNegative().run(-42).pass).toBe(true);
    expect(enforce.isNumber().isNegative().run(-Infinity).pass).toBe(true);
    expect(enforce.isNumber().isNegative().run(-0.1).pass).toBe(true);
  });

  it('fails for positive numbers and zero', () => {
    expect(enforce.isNumber().isNegative().run(0).pass).toBe(false);
    expect(enforce.isNumber().isNegative().run(1).pass).toBe(false);
    expect(enforce.isNumber().isNegative().run(42).pass).toBe(false);
    expect(enforce.isNumber().isNegative().run(Infinity).pass).toBe(false);
  });
});
