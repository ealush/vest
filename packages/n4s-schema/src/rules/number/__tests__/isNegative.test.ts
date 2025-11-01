import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('isNegative', () => {
  it('passes for negative numbers', () => {
    expect(isNumber().isNegative().run(-1).passes).toBe(true);
    expect(isNumber().isNegative().run(-42).passes).toBe(true);
    expect(isNumber().isNegative().run(-Infinity).passes).toBe(true);
    expect(isNumber().isNegative().run(-0.1).passes).toBe(true);
  });

  it('fails for positive numbers and zero', () => {
    expect(isNumber().isNegative().run(0).passes).toBe(false);
    expect(isNumber().isNegative().run(1).passes).toBe(false);
    expect(isNumber().isNegative().run(42).passes).toBe(false);
    expect(isNumber().isNegative().run(Infinity).passes).toBe(false);
  });
});
