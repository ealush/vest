import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('numberEquals', () => {
  it('passes when numbers are equal', () => {
    expect(isNumber().numberEquals(5).run(5).passes).toBe(true);
    expect(isNumber().numberEquals('2').run(2).passes).toBe(true);
    expect(isNumber().numberEquals(0).run(0).passes).toBe(true);
    expect(isNumber().numberEquals(-5).run(-5).passes).toBe(true);
  });

  it('fails when numbers are not equal', () => {
    expect(isNumber().numberEquals(5).run(4).passes).toBe(false);
    expect(isNumber().numberEquals('2').run(3).passes).toBe(false);
    expect(isNumber().numberEquals(0).run(1).passes).toBe(false);
  });
});
