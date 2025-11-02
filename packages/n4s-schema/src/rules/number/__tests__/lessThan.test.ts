import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('lessThan', () => {
  it('pass when number is less', () => {
    expect(enforceLazy.isNumber().lessThan(5).run(4).pass).toBe(true);
    expect(enforceLazy.isNumber().lessThan(0).run(-1).pass).toBe(true);
    expect(enforceLazy.isNumber().lessThan(10).run(5).pass).toBe(true);
    expect(enforceLazy.isNumber().lessThan(1).run(0.5).pass).toBe(true);
  });

  it('fails when number is not less', () => {
    expect(enforceLazy.isNumber().lessThan(5).run(5).pass).toBe(false);
    expect(enforceLazy.isNumber().lessThan(5).run(6).pass).toBe(false);
    expect(enforceLazy.isNumber().lessThan(0).run(0).pass).toBe(false);
  });
});
