import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isOdd', () => {
  it('passes for odd numbers', () => {
    expect(enforceLazy.isNumber().isOdd().run(1).passes).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(3).passes).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(-1).passes).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(99).passes).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(-99).passes).toBe(true);
  });

  it('fails for even numbers', () => {
    expect(enforceLazy.isNumber().isOdd().run(0).passes).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(2).passes).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(-2).passes).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(42).passes).toBe(false);
  });
});
