import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('lessThan (numeric)', () => {
  it('pass when numeric string is less', () => {
    expect(enforce.isNumeric().lessThan(5).run('3').pass).toBe(true);
    expect(enforce.isNumeric().lessThan(0).run('-1').pass).toBe(true);
    expect(enforce.isNumeric().lessThan(10).run('5').pass).toBe(true);
  });

  it('pass when number is less', () => {
    expect(enforce.isNumeric().lessThan(5).run(3).pass).toBe(true);
    expect(enforce.isNumeric().lessThan(0).run(-1).pass).toBe(true);
  });

  it('fails when value is not less', () => {
    expect(enforce.isNumeric().lessThan(5).run('5').pass).toBe(false);
    expect(enforce.isNumeric().lessThan(5).run('6').pass).toBe(false);
    expect(enforce.isNumeric().lessThan(0).run(0).pass).toBe(false);
  });
});
