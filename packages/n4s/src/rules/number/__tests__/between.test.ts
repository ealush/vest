import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isBetween', () => {
  it('pass when number is between bounds (inclusive)', () => {
    expect(enforce.isNumber().isBetween(0, 10).run(5).pass).toBe(true);
    expect(enforce.isNumber().isBetween(0, 10).run(0).pass).toBe(true);
    expect(enforce.isNumber().isBetween(0, 10).run(10).pass).toBe(true);
    expect(enforce.isNumber().isBetween(-5, 5).run(0).pass).toBe(true);
  });

  it('fails when number is outside bounds', () => {
    expect(enforce.isNumber().isBetween(0, 10).run(-1).pass).toBe(false);
    expect(enforce.isNumber().isBetween(0, 10).run(11).pass).toBe(false);
    expect(enforce.isNumber().isBetween(5, 10).run(4).pass).toBe(false);
  });
});
