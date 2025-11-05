import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('greaterThan', () => {
  it('pass when number is greater', () => {
    expect(enforce.isNumber().greaterThan(0).run(1).pass).toBe(true);
    expect(enforce.isNumber().greaterThan(5).run(10).pass).toBe(true);
    expect(enforce.isNumber().greaterThan(-10).run(-5).pass).toBe(true);
    expect(enforce.isNumber().greaterThan(0).run(0.1).pass).toBe(true);
  });

  it('fails when number is not greater', () => {
    expect(enforce.isNumber().greaterThan(1).run(0).pass).toBe(false);
    expect(enforce.isNumber().greaterThan(5).run(5).pass).toBe(false);
    expect(enforce.isNumber().greaterThan(10).run(5).pass).toBe(false);
  });
});
