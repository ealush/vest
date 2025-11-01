import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('lessThanOrEquals (numeric)', () => {
  it('passes when numeric string is less or equal', () => {
    expect(enforceLazy.isNumeric().lessThanOrEquals(5).run('4').passes).toBe(true);
    expect(enforceLazy.isNumeric().lessThanOrEquals(5).run('5').passes).toBe(true);
    expect(enforceLazy.isNumeric().lessThanOrEquals(10).run('5').passes).toBe(true);
  });

  it('passes when number is less or equal', () => {
    expect(enforceLazy.isNumeric().lessThanOrEquals(5).run(4).passes).toBe(true);
    expect(enforceLazy.isNumeric().lessThanOrEquals(5).run(5).passes).toBe(true);
  });

  it('fails when value is greater', () => {
    expect(enforceLazy.isNumeric().lessThanOrEquals(5).run('6').passes).toBe(false);
    expect(enforceLazy.isNumeric().lessThanOrEquals(0).run('1').passes).toBe(false);
    expect(enforceLazy.isNumeric().lessThanOrEquals(5).run(10).passes).toBe(false);
  });
});
