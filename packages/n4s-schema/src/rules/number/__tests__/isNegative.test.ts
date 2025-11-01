import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNegative', () => {
  it('passes for negative numbers', () => {
    expect(enforceLazy.isNumber().isNegative().run(-1).passes).toBe(true);
    expect(enforceLazy.isNumber().isNegative().run(-42).passes).toBe(true);
    expect(enforceLazy.isNumber().isNegative().run(-Infinity).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().isNegative().run(-0.1).passes).toBe(true);
  });

  it('fails for positive numbers and zero', () => {
    expect(enforceLazy.isNumber().isNegative().run(0).passes).toBe(false);
    expect(enforceLazy.isNumber().isNegative().run(1).passes).toBe(false);
    expect(enforceLazy.isNumber().isNegative().run(42).passes).toBe(false);
    expect(enforceLazy.isNumber().isNegative().run(Infinity).passes).toBe(
      false,
    );
  });
});
