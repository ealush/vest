import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('greaterThanOrEquals', () => {
  it('passes when number is greater or equal', () => {
    expect(isNumber().greaterThanOrEquals(0).run(1).passes).toBe(true);
    expect(isNumber().greaterThanOrEquals(5).run(5).passes).toBe(true);
    expect(isNumber().greaterThanOrEquals(5).run(10).passes).toBe(true);
    expect(isNumber().greaterThanOrEquals(0).run(0).passes).toBe(true);
  });

  it('fails when number is less', () => {
    expect(isNumber().greaterThanOrEquals(5).run(4).passes).toBe(false);
    expect(isNumber().greaterThanOrEquals(0).run(-1).passes).toBe(false);
    expect(isNumber().greaterThanOrEquals(10).run(5).passes).toBe(false);
  });
});
