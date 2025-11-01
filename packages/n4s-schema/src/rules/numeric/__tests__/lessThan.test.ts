import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('lessThan (numeric)', () => {
  it('passes when numeric string is less', () => {
    expect(enforceLazy.isNumeric().lessThan(5).run('3').passes).toBe(true);
    expect(enforceLazy.isNumeric().lessThan(0).run('-1').passes).toBe(true);
    expect(enforceLazy.isNumeric().lessThan(10).run('5').passes).toBe(true);
  });

  it('passes when number is less', () => {
    expect(enforceLazy.isNumeric().lessThan(5).run(3).passes).toBe(true);
    expect(enforceLazy.isNumeric().lessThan(0).run(-1).passes).toBe(true);
  });

  it('fails when value is not less', () => {
    expect(enforceLazy.isNumeric().lessThan(5).run('5').passes).toBe(false);
    expect(enforceLazy.isNumeric().lessThan(5).run('6').passes).toBe(false);
    expect(enforceLazy.isNumeric().lessThan(0).run(0).passes).toBe(false);
  });
});
