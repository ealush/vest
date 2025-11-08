import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('greaterThanOrEquals', () => {
  it('pass when number is greater or equal', () => {
    expect(enforce.isNumber().greaterThanOrEquals(0).run(1).pass).toBe(true);
    expect(enforce.isNumber().greaterThanOrEquals(5).run(5).pass).toBe(true);
    expect(enforce.isNumber().greaterThanOrEquals(5).run(10).pass).toBe(true);
    expect(enforce.isNumber().greaterThanOrEquals(0).run(0).pass).toBe(true);
  });

  it('fails when number is less', () => {
    expect(enforce.isNumber().greaterThanOrEquals(5).run(4).pass).toBe(false);
    expect(enforce.isNumber().greaterThanOrEquals(0).run(-1).pass).toBe(false);
    expect(enforce.isNumber().greaterThanOrEquals(10).run(5).pass).toBe(false);
  });
});
