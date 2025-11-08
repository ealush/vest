import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('lessThanOrEquals', () => {
  it('pass when number is less or equal', () => {
    expect(enforce.isNumber().lessThanOrEquals(5).run(4).pass).toBe(true);
    expect(enforce.isNumber().lessThanOrEquals(5).run(5).pass).toBe(true);
    expect(enforce.isNumber().lessThanOrEquals(1).run(1).pass).toBe(true);
    expect(enforce.isNumber().lessThanOrEquals(10).run(5).pass).toBe(true);
  });

  it('fails when number is greater', () => {
    expect(enforce.isNumber().lessThanOrEquals(5).run(6).pass).toBe(false);
    expect(enforce.isNumber().lessThanOrEquals(0).run(1).pass).toBe(false);
    expect(enforce.isNumber().lessThanOrEquals(5).run(10).pass).toBe(false);
  });
});
