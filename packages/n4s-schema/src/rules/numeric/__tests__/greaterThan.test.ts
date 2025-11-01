import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('greaterThan (numeric)', () => {
  it('passes when numeric string is greater', () => {
    expect(enforceLazy.isNumeric().greaterThan(1).run('2').passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThan(0).run('5').passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThan(-10).run('-5').passes).toBe(true);
  });

  it('passes when number is greater', () => {
    expect(enforceLazy.isNumeric().greaterThan(1).run(2).passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThan(0).run(5).passes).toBe(true);
  });

  it('fails when value is not greater', () => {
    expect(enforceLazy.isNumeric().greaterThan(5).run('5').passes).toBe(false);
    expect(enforceLazy.isNumeric().greaterThan(5).run('3').passes).toBe(false);
    expect(enforceLazy.isNumeric().greaterThan(5).run(3).passes).toBe(false);
  });
});
