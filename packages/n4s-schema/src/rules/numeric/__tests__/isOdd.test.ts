import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isOdd (numeric)', () => {
  it('passes for odd numeric strings', () => {
    expect(enforceLazy.isNumeric().isOdd().run('1').passes).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run('3').passes).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run('99').passes).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run('-1').passes).toBe(true);
  });

  it('passes for odd numbers', () => {
    expect(enforceLazy.isNumeric().isOdd().run(1).passes).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run(3).passes).toBe(true);
    expect(enforceLazy.isNumeric().isOdd().run(99).passes).toBe(true);
  });

  it('fails for even values', () => {
    expect(enforceLazy.isNumeric().isOdd().run('0').passes).toBe(false);
    expect(enforceLazy.isNumeric().isOdd().run('2').passes).toBe(false);
    expect(enforceLazy.isNumeric().isOdd().run(2).passes).toBe(false);
  });
});
