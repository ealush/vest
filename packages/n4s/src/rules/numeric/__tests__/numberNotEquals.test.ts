import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('numberNotEquals (numeric)', () => {
  it('pass when numeric strings are not equal', () => {
    expect(enforce.isNumeric().numberNotEquals('2').run('3').pass).toBe(true);
    expect(enforce.isNumeric().numberNotEquals(5).run('4').pass).toBe(true);
    expect(enforce.isNumeric().numberNotEquals(0).run('1').pass).toBe(true);
  });

  it('pass when number does not match', () => {
    expect(enforce.isNumeric().numberNotEquals('2').run(3).pass).toBe(true);
  });

  it('fails when values are equal', () => {
    expect(enforce.isNumeric().numberNotEquals('2').run('2').pass).toBe(false);
    expect(enforce.isNumeric().numberNotEquals(5).run('5').pass).toBe(false);
    expect(enforce.isNumeric().numberNotEquals('0').run(0).pass).toBe(false);
  });
});
