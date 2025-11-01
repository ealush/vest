import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('greaterThanOrEquals (numeric)', () => {
  it('passes when numeric string is greater or equal', () => {
    expect(enforceLazy.isNumeric().greaterThanOrEquals(1).run('2').passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThanOrEquals(5).run('5').passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThanOrEquals(0).run('0').passes).toBe(true);
  });

  it('passes when number is greater or equal', () => {
    expect(enforceLazy.isNumeric().greaterThanOrEquals(1).run(2).passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThanOrEquals(5).run(5).passes).toBe(true);
  });

  it('fails when value is less', () => {
    expect(enforceLazy.isNumeric().greaterThanOrEquals(5).run('4').passes).toBe(false);
    expect(enforceLazy.isNumeric().greaterThanOrEquals(0).run('-1').passes).toBe(false);
    expect(enforceLazy.isNumeric().greaterThanOrEquals(10).run(5).passes).toBe(false);
  });
});
