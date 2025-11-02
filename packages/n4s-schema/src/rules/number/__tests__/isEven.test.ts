import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isEven', () => {
  it('pass for even numbers', () => {
    expect(enforceLazy.isNumber().isEven().run(0).pass).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(2).pass).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(42).pass).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(-2).pass).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(-100).pass).toBe(true);
  });

  it('fails for odd numbers', () => {
    expect(enforceLazy.isNumber().isEven().run(1).pass).toBe(false);
    expect(enforceLazy.isNumber().isEven().run(3).pass).toBe(false);
    expect(enforceLazy.isNumber().isEven().run(-1).pass).toBe(false);
    expect(enforceLazy.isNumber().isEven().run(99).pass).toBe(false);
  });
});
