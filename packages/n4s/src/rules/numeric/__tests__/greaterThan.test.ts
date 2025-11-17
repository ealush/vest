import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('greaterThan (numeric)', () => {
  it('pass when numeric string is greater', () => {
    expect(enforce.isNumeric().greaterThan(1).run('2').pass).toBe(true);
    expect(enforce.isNumeric().greaterThan(0).run('5').pass).toBe(true);
    expect(enforce.isNumeric().greaterThan(-10).run('-5').pass).toBe(true);
  });

  it('pass when number is greater', () => {
    expect(enforce.isNumeric().greaterThan(1).run(2).pass).toBe(true);
    expect(enforce.isNumeric().greaterThan(0).run(5).pass).toBe(true);
  });

  it('fails when value is not greater', () => {
    expect(enforce.isNumeric().greaterThan(5).run('5').pass).toBe(false);
    expect(enforce.isNumeric().greaterThan(5).run('3').pass).toBe(false);
    expect(enforce.isNumeric().greaterThan(5).run(3).pass).toBe(false);
  });
});
