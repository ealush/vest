import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotBetween', () => {
  it('passes when number is outside bounds', () => {
    expect(enforceLazy.isNumber().isNotBetween(0, 10).run(-1).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().isNotBetween(0, 10).run(11).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().isNotBetween(5, 10).run(4).passes).toBe(true);
    expect(enforceLazy.isNumber().isNotBetween(5, 10).run(15).passes).toBe(
      true,
    );
  });

  it('fails when number is between bounds (inclusive)', () => {
    expect(enforceLazy.isNumber().isNotBetween(0, 10).run(0).passes).toBe(
      false,
    );
    expect(enforceLazy.isNumber().isNotBetween(0, 10).run(5).passes).toBe(
      false,
    );
    expect(enforceLazy.isNumber().isNotBetween(0, 10).run(10).passes).toBe(
      false,
    );
  });
});
