import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isBetween', () => {
  it('passes when number is between bounds (inclusive)', () => {
    expect(enforceLazy.isNumber().isBetween(0, 10).run(5).passes).toBe(true);
    expect(enforceLazy.isNumber().isBetween(0, 10).run(0).passes).toBe(true);
    expect(enforceLazy.isNumber().isBetween(0, 10).run(10).passes).toBe(true);
    expect(enforceLazy.isNumber().isBetween(-5, 5).run(0).passes).toBe(true);
  });

  it('fails when number is outside bounds', () => {
    expect(enforceLazy.isNumber().isBetween(0, 10).run(-1).passes).toBe(false);
    expect(enforceLazy.isNumber().isBetween(0, 10).run(11).passes).toBe(false);
    expect(enforceLazy.isNumber().isBetween(5, 10).run(4).passes).toBe(false);
  });
});
