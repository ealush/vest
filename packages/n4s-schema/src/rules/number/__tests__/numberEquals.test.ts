import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numberEquals', () => {
  it('pass when numbers are equal', () => {
    expect(enforceLazy.isNumber().numberEquals(5).run(5).pass).toBe(true);
    expect(enforceLazy.isNumber().numberEquals('2').run(2).pass).toBe(true);
    expect(enforceLazy.isNumber().numberEquals(0).run(0).pass).toBe(true);
    expect(enforceLazy.isNumber().numberEquals(-5).run(-5).pass).toBe(true);
  });

  it('fails when numbers are not equal', () => {
    expect(enforceLazy.isNumber().numberEquals(5).run(4).pass).toBe(false);
    expect(enforceLazy.isNumber().numberEquals('2').run(3).pass).toBe(false);
    expect(enforceLazy.isNumber().numberEquals(0).run(1).pass).toBe(false);
  });
});
