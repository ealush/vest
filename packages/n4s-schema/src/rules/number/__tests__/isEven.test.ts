import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('isEven', () => {
  it('passes for even numbers', () => {
    expect(isNumber().isEven().run(0).passes).toBe(true);
    expect(isNumber().isEven().run(2).passes).toBe(true);
    expect(isNumber().isEven().run(42).passes).toBe(true);
    expect(isNumber().isEven().run(-2).passes).toBe(true);
    expect(isNumber().isEven().run(-100).passes).toBe(true);
  });

  it('fails for odd numbers', () => {
    expect(isNumber().isEven().run(1).passes).toBe(false);
    expect(isNumber().isEven().run(3).passes).toBe(false);
    expect(isNumber().isEven().run(-1).passes).toBe(false);
    expect(isNumber().isEven().run(99).passes).toBe(false);
  });
});
