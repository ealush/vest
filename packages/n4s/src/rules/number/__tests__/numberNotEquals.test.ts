import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('numberNotEquals', () => {
  it('pass when numbers are not equal', () => {
    expect(enforce.isNumber().numberNotEquals(5).run(4).pass).toBe(true);
    expect(enforce.isNumber().numberNotEquals('2').run(3).pass).toBe(true);
    expect(enforce.isNumber().numberNotEquals(0).run(1).pass).toBe(true);
    expect(enforce.isNumber().numberNotEquals(10).run(-10).pass).toBe(true);
  });

  it('fails when numbers are equal', () => {
    expect(enforce.isNumber().numberNotEquals(5).run(5).pass).toBe(false);
    expect(enforce.isNumber().numberNotEquals('2').run(2).pass).toBe(false);
    expect(enforce.isNumber().numberNotEquals(0).run(0).pass).toBe(false);
  });
});
