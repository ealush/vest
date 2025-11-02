import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('greaterThanOrEquals (numeric)', () => {
  it('pass when numeric string is greater or equal', () => {
    expect(enforceLazy.isNumeric().greaterThanOrEquals(1).run('2').pass).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().greaterThanOrEquals(5).run('5').pass).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().greaterThanOrEquals(0).run('0').pass).toBe(
      true,
    );
  });

  it('pass when number is greater or equal', () => {
    expect(enforceLazy.isNumeric().greaterThanOrEquals(1).run(2).pass).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().greaterThanOrEquals(5).run(5).pass).toBe(
      true,
    );
  });

  it('fails when value is less', () => {
    expect(enforceLazy.isNumeric().greaterThanOrEquals(5).run('4').pass).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().greaterThanOrEquals(0).run('-1').pass).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().greaterThanOrEquals(10).run(5).pass).toBe(
      false,
    );
  });
});
