import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isEven', () => {
  it('pass for even numbers', () => {
    expect(enforce.isNumber().isEven().run(0).pass).toBe(true);
    expect(enforce.isNumber().isEven().run(2).pass).toBe(true);
    expect(enforce.isNumber().isEven().run(42).pass).toBe(true);
    expect(enforce.isNumber().isEven().run(-2).pass).toBe(true);
    expect(enforce.isNumber().isEven().run(-100).pass).toBe(true);
  });

  it('fails for odd numbers', () => {
    expect(enforce.isNumber().isEven().run(1).pass).toBe(false);
    expect(enforce.isNumber().isEven().run(3).pass).toBe(false);
    expect(enforce.isNumber().isEven().run(-1).pass).toBe(false);
    expect(enforce.isNumber().isEven().run(99).pass).toBe(false);
  });
});
