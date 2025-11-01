import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numberNotEquals (numeric)', () => {
  it('passes when numeric strings are not equal', () => {
    expect(enforceLazy.isNumeric().numberNotEquals('2').run('3').passes).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().numberNotEquals(5).run('4').passes).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().numberNotEquals(0).run('1').passes).toBe(
      true,
    );
  });

  it('passes when number does not match', () => {
    expect(enforceLazy.isNumeric().numberNotEquals('2').run(3).passes).toBe(
      true,
    );
  });

  it('fails when values are equal', () => {
    expect(enforceLazy.isNumeric().numberNotEquals('2').run('2').passes).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().numberNotEquals(5).run('5').passes).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().numberNotEquals('0').run(0).passes).toBe(
      false,
    );
  });
});
