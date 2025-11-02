import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('greaterThan', () => {
  it('pass when number is greater', () => {
    expect(enforceLazy.isNumber().greaterThan(0).run(1).pass).toBe(true);
    expect(enforceLazy.isNumber().greaterThan(5).run(10).pass).toBe(true);
    expect(enforceLazy.isNumber().greaterThan(-10).run(-5).pass).toBe(true);
    expect(enforceLazy.isNumber().greaterThan(0).run(0.1).pass).toBe(true);
  });

  it('fails when number is not greater', () => {
    expect(enforceLazy.isNumber().greaterThan(1).run(0).pass).toBe(false);
    expect(enforceLazy.isNumber().greaterThan(5).run(5).pass).toBe(false);
    expect(enforceLazy.isNumber().greaterThan(10).run(5).pass).toBe(false);
  });
});
