import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isOdd', () => {
  it('pass for odd numbers', () => {
    expect(enforceLazy.isNumber().isOdd().run(1).pass).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(3).pass).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(-1).pass).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(99).pass).toBe(true);
    expect(enforceLazy.isNumber().isOdd().run(-99).pass).toBe(true);
  });

  it('fails for even numbers', () => {
    expect(enforceLazy.isNumber().isOdd().run(0).pass).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(2).pass).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(-2).pass).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(42).pass).toBe(false);
  });
});
