import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isEven', () => {
  it('passes for even numbers', () => {
    expect(enforceLazy.isNumber().isEven().run(0).passes).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(2).passes).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(42).passes).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(-2).passes).toBe(true);
    expect(enforceLazy.isNumber().isEven().run(-100).passes).toBe(true);
  });

  it('fails for odd numbers', () => {
    expect(enforceLazy.isNumber().isEven().run(1).passes).toBe(false);
    expect(enforceLazy.isNumber().isEven().run(3).passes).toBe(false);
    expect(enforceLazy.isNumber().isEven().run(-1).passes).toBe(false);
    expect(enforceLazy.isNumber().isEven().run(99).passes).toBe(false);
  });
});
