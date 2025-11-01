import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('numberNotEquals (numeric)', () => {
  it('passes when numeric strings are not equal', () => {
    expect(isNumeric().numberNotEquals('2').run('3').passes).toBe(true);
    expect(isNumeric().numberNotEquals(5).run('4').passes).toBe(true);
    expect(isNumeric().numberNotEquals(0).run('1').passes).toBe(true);
  });

  it('passes when number does not match', () => {
    expect(isNumeric().numberNotEquals('2').run(3).passes).toBe(true);
  });

  it('fails when values are equal', () => {
    expect(isNumeric().numberNotEquals('2').run('2').passes).toBe(false);
    expect(isNumeric().numberNotEquals(5).run('5').passes).toBe(false);
    expect(isNumeric().numberNotEquals('0').run(0).passes).toBe(false);
  });
});
