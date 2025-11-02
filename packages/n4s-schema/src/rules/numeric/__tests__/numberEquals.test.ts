import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numberEquals (numeric)', () => {
  it('pass when numeric strings are equal', () => {
    expect(enforceLazy.isNumeric().numberEquals('2').run('2').pass).toBe(true);
    expect(enforceLazy.isNumeric().numberEquals(5).run('5').pass).toBe(true);
    expect(enforceLazy.isNumeric().numberEquals(0).run('0').pass).toBe(true);
  });

  it('pass when number matches', () => {
    expect(enforceLazy.isNumeric().numberEquals('2').run(2).pass).toBe(true);
  });

  it('fails when values are not equal', () => {
    expect(enforceLazy.isNumeric().numberEquals('2').run('3').pass).toBe(false);
    expect(enforceLazy.isNumeric().numberEquals(5).run('4').pass).toBe(false);
    expect(enforceLazy.isNumeric().numberEquals(0).run(1).pass).toBe(false);
  });
});
