import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('lessThan', () => {
  it('passes when number is less', () => {
    expect(enforceLazy.isNumber().lessThan(5).run(4).passes).toBe(true);
    expect(enforceLazy.isNumber().lessThan(0).run(-1).passes).toBe(true);
    expect(enforceLazy.isNumber().lessThan(10).run(5).passes).toBe(true);
    expect(enforceLazy.isNumber().lessThan(1).run(0.5).passes).toBe(true);
  });

  it('fails when number is not less', () => {
    expect(enforceLazy.isNumber().lessThan(5).run(5).passes).toBe(false);
    expect(enforceLazy.isNumber().lessThan(5).run(6).passes).toBe(false);
    expect(enforceLazy.isNumber().lessThan(0).run(0).passes).toBe(false);
  });
});
