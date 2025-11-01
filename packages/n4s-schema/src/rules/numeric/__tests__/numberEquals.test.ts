import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('numberEquals (numeric)', () => {
  it('passes when numeric strings are equal', () => {
    expect(isNumeric().numberEquals('2').run('2').passes).toBe(true);
    expect(isNumeric().numberEquals(5).run('5').passes).toBe(true);
    expect(isNumeric().numberEquals(0).run('0').passes).toBe(true);
  });

  it('passes when number matches', () => {
    expect(isNumeric().numberEquals('2').run(2).passes).toBe(true);
  });

  it('fails when values are not equal', () => {
    expect(isNumeric().numberEquals('2').run('3').passes).toBe(false);
    expect(isNumeric().numberEquals(5).run('4').passes).toBe(false);
    expect(isNumeric().numberEquals(0).run(1).passes).toBe(false);
  });
});
