import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('lessThanOrEquals (numeric)', () => {
  it('passes when numeric string is less or equal', () => {
    expect(isNumeric().lessThanOrEquals(5).run('4').passes).toBe(true);
    expect(isNumeric().lessThanOrEquals(5).run('5').passes).toBe(true);
    expect(isNumeric().lessThanOrEquals(10).run('5').passes).toBe(true);
  });

  it('passes when number is less or equal', () => {
    expect(isNumeric().lessThanOrEquals(5).run(4).passes).toBe(true);
    expect(isNumeric().lessThanOrEquals(5).run(5).passes).toBe(true);
  });

  it('fails when value is greater', () => {
    expect(isNumeric().lessThanOrEquals(5).run('6').passes).toBe(false);
    expect(isNumeric().lessThanOrEquals(0).run('1').passes).toBe(false);
    expect(isNumeric().lessThanOrEquals(5).run(10).passes).toBe(false);
  });
});
