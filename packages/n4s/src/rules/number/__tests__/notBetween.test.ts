import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isNotBetween', () => {
  it('pass when number is outside bounds', () => {
    expect(enforce.isNumber().isNotBetween(0, 10).run(-1).pass).toBe(true);
    expect(enforce.isNumber().isNotBetween(0, 10).run(11).pass).toBe(true);
    expect(enforce.isNumber().isNotBetween(5, 10).run(4).pass).toBe(true);
    expect(enforce.isNumber().isNotBetween(5, 10).run(15).pass).toBe(true);
  });

  it('fails when number is between bounds (inclusive)', () => {
    expect(enforce.isNumber().isNotBetween(0, 10).run(0).pass).toBe(false);
    expect(enforce.isNumber().isNotBetween(0, 10).run(5).pass).toBe(false);
    expect(enforce.isNumber().isNotBetween(0, 10).run(10).pass).toBe(false);
  });
});
