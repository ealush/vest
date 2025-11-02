import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('lessThan (numeric)', () => {
  it('pass when numeric string is less', () => {
    expect(enforceLazy.isNumeric().lessThan(5).run('3').pass).toBe(true);
    expect(enforceLazy.isNumeric().lessThan(0).run('-1').pass).toBe(true);
    expect(enforceLazy.isNumeric().lessThan(10).run('5').pass).toBe(true);
  });

  it('pass when number is less', () => {
    expect(enforceLazy.isNumeric().lessThan(5).run(3).pass).toBe(true);
    expect(enforceLazy.isNumeric().lessThan(0).run(-1).pass).toBe(true);
  });

  it('fails when value is not less', () => {
    expect(enforceLazy.isNumeric().lessThan(5).run('5').pass).toBe(false);
    expect(enforceLazy.isNumeric().lessThan(5).run('6').pass).toBe(false);
    expect(enforceLazy.isNumeric().lessThan(0).run(0).pass).toBe(false);
  });
});
