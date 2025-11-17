import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('lessThanOrEquals (numeric)', () => {
  it('pass when numeric string is less or equal', () => {
    expect(enforce.isNumeric().lessThanOrEquals(5).run('4').pass).toBe(true);
    expect(enforce.isNumeric().lessThanOrEquals(5).run('5').pass).toBe(true);
    expect(enforce.isNumeric().lessThanOrEquals(10).run('5').pass).toBe(true);
  });

  it('pass when number is less or equal', () => {
    expect(enforce.isNumeric().lessThanOrEquals(5).run(4).pass).toBe(true);
    expect(enforce.isNumeric().lessThanOrEquals(5).run(5).pass).toBe(true);
  });

  it('fails when value is greater', () => {
    expect(enforce.isNumeric().lessThanOrEquals(5).run('6').pass).toBe(false);
    expect(enforce.isNumeric().lessThanOrEquals(0).run('1').pass).toBe(false);
    expect(enforce.isNumeric().lessThanOrEquals(5).run(10).pass).toBe(false);
  });
});
