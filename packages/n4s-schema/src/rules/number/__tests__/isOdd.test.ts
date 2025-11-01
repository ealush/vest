import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('isOdd', () => {
  it('passes for odd numbers', () => {
    expect(isNumber().isOdd().run(1).passes).toBe(true);
    expect(isNumber().isOdd().run(3).passes).toBe(true);
    expect(isNumber().isOdd().run(-1).passes).toBe(true);
    expect(isNumber().isOdd().run(99).passes).toBe(true);
    expect(isNumber().isOdd().run(-99).passes).toBe(true);
  });

  it('fails for even numbers', () => {
    expect(isNumber().isOdd().run(0).passes).toBe(false);
    expect(isNumber().isOdd().run(2).passes).toBe(false);
    expect(isNumber().isOdd().run(-2).passes).toBe(false);
    expect(isNumber().isOdd().run(42).passes).toBe(false);
  });
});
