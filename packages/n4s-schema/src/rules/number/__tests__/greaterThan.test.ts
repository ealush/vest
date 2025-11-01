import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('greaterThan', () => {
  it('passes when number is greater', () => {
    expect(isNumber().greaterThan(0).run(1).passes).toBe(true);
    expect(isNumber().greaterThan(5).run(10).passes).toBe(true);
    expect(isNumber().greaterThan(-10).run(-5).passes).toBe(true);
    expect(isNumber().greaterThan(0).run(0.1).passes).toBe(true);
  });

  it('fails when number is not greater', () => {
    expect(isNumber().greaterThan(1).run(0).passes).toBe(false);
    expect(isNumber().greaterThan(5).run(5).passes).toBe(false);
    expect(isNumber().greaterThan(10).run(5).passes).toBe(false);
  });
});
