import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('numberNotEquals', () => {
  it('passes when numbers are not equal', () => {
    expect(isNumber().numberNotEquals(5).run(4).passes).toBe(true);
    expect(isNumber().numberNotEquals('2').run(3).passes).toBe(true);
    expect(isNumber().numberNotEquals(0).run(1).passes).toBe(true);
    expect(isNumber().numberNotEquals(10).run(-10).passes).toBe(true);
  });

  it('fails when numbers are equal', () => {
    expect(isNumber().numberNotEquals(5).run(5).passes).toBe(false);
    expect(isNumber().numberNotEquals('2').run(2).passes).toBe(false);
    expect(isNumber().numberNotEquals(0).run(0).passes).toBe(false);
  });
});
