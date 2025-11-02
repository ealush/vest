import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('notBetween (numeric)', () => {
  it('pass when numeric string is outside bounds', () => {
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run('-1').pass).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run('11').pass).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().isNotBetween(5, 10).run('4').pass).toBe(
      true,
    );
  });

  it('pass when number is outside bounds', () => {
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run(-1).pass).toBe(true);
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run(11).pass).toBe(true);
  });

  it('fails when value is between bounds', () => {
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run('0').pass).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run('5').pass).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().isNotBetween(0, 10).run(10).pass).toBe(
      false,
    );
  });
});
