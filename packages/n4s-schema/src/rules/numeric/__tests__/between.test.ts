import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('between (numeric)', () => {
  it('passes when numeric string is between', () => {
    expect(enforceLazy.isNumeric().between(0, 10).run('5').passes).toBe(true);
    expect(enforceLazy.isNumeric().between(0, 10).run('0').passes).toBe(true);
    expect(enforceLazy.isNumeric().between(0, 10).run('10').passes).toBe(true);
    expect(enforceLazy.isNumeric().between(-5, 5).run('0').passes).toBe(true);
  });

  it('passes when number is between', () => {
    expect(enforceLazy.isNumeric().between(0, 10).run(5).passes).toBe(true);
  });

  it('fails when value is outside range', () => {
    expect(enforceLazy.isNumeric().between(0, 10).run('-1').passes).toBe(false);
    expect(enforceLazy.isNumeric().between(0, 10).run('11').passes).toBe(false);
    expect(enforceLazy.isNumeric().between(5, 10).run(4).passes).toBe(false);
  });
});
