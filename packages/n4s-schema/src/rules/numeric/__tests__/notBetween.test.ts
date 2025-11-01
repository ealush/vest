import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('notBetween (numeric)', () => {
  it('passes when numeric string is outside bounds', () => {
    expect(isNumeric().notBetween(0, 10).run('-1').passes).toBe(true);
    expect(isNumeric().notBetween(0, 10).run('11').passes).toBe(true);
    expect(isNumeric().notBetween(5, 10).run('4').passes).toBe(true);
  });

  it('passes when number is outside bounds', () => {
    expect(isNumeric().notBetween(0, 10).run(-1).passes).toBe(true);
    expect(isNumeric().notBetween(0, 10).run(11).passes).toBe(true);
  });

  it('fails when value is between bounds', () => {
    expect(isNumeric().notBetween(0, 10).run('0').passes).toBe(false);
    expect(isNumeric().notBetween(0, 10).run('5').passes).toBe(false);
    expect(isNumeric().notBetween(0, 10).run(10).passes).toBe(false);
  });
});
