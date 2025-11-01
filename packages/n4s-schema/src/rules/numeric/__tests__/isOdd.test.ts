import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('isOdd (numeric)', () => {
  it('passes for odd numeric strings', () => {
    expect(isNumeric().isOdd().run('1').passes).toBe(true);
    expect(isNumeric().isOdd().run('3').passes).toBe(true);
    expect(isNumeric().isOdd().run('99').passes).toBe(true);
    expect(isNumeric().isOdd().run('-1').passes).toBe(true);
  });

  it('passes for odd numbers', () => {
    expect(isNumeric().isOdd().run(1).passes).toBe(true);
    expect(isNumeric().isOdd().run(3).passes).toBe(true);
    expect(isNumeric().isOdd().run(99).passes).toBe(true);
  });

  it('fails for even values', () => {
    expect(isNumeric().isOdd().run('0').passes).toBe(false);
    expect(isNumeric().isOdd().run('2').passes).toBe(false);
    expect(isNumeric().isOdd().run(2).passes).toBe(false);
  });
});
