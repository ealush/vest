import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numberNotEquals (numeric)', () => {
  it('pass when numeric strings are not equal', () => {
    expect(enforceLazy.isNumeric().numberNotEquals('2').run('3').pass).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().numberNotEquals(5).run('4').pass).toBe(true);
    expect(enforceLazy.isNumeric().numberNotEquals(0).run('1').pass).toBe(true);
  });

  it('pass when number does not match', () => {
    expect(enforceLazy.isNumeric().numberNotEquals('2').run(3).pass).toBe(true);
  });

  it('fails when values are equal', () => {
    expect(enforceLazy.isNumeric().numberNotEquals('2').run('2').pass).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().numberNotEquals(5).run('5').pass).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().numberNotEquals('0').run(0).pass).toBe(
      false,
    );
  });
});
