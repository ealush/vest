import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isPositive', () => {
  it('passes for positive numbers', () => {
    expect(enforceLazy.isNumber().isPositive().run(1).passes).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(42).passes).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(Infinity).passes).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(0.1).passes).toBe(true);
  });

  it('fails for zero and negative numbers', () => {
    expect(enforceLazy.isNumber().isPositive().run(0).passes).toBe(false);
    expect(enforceLazy.isNumber().isPositive().run(-1).passes).toBe(false);
    expect(enforceLazy.isNumber().isPositive().run(-42).passes).toBe(false);
    expect(enforceLazy.isNumber().isPositive().run(-Infinity).passes).toBe(false);
  });
});
