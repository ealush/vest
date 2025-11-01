import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numberEquals (numeric)', () => {
  it('passes when numeric strings are equal', () => {
    expect(enforceLazy.isNumeric().numberEquals('2').run('2').passes).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().numberEquals(5).run('5').passes).toBe(true);
    expect(enforceLazy.isNumeric().numberEquals(0).run('0').passes).toBe(true);
  });

  it('passes when number matches', () => {
    expect(enforceLazy.isNumeric().numberEquals('2').run(2).passes).toBe(true);
  });

  it('fails when values are not equal', () => {
    expect(enforceLazy.isNumeric().numberEquals('2').run('3').passes).toBe(
      false,
    );
    expect(enforceLazy.isNumeric().numberEquals(5).run('4').passes).toBe(false);
    expect(enforceLazy.isNumeric().numberEquals(0).run(1).passes).toBe(false);
  });
});
