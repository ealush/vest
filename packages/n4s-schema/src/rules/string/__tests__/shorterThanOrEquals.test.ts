import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('shorterThanOrEquals', () => {
  it('passes when string length is less than or equal to specified value', () => {
    expect(isString().shorterThanOrEquals(5).run('hello').passes).toBe(true);
    expect(isString().shorterThanOrEquals(6).run('hello').passes).toBe(true);
    expect(isString().shorterThanOrEquals(0).run('').passes).toBe(true);
  });

  it('fails when string length is greater than specified value', () => {
    expect(isString().shorterThanOrEquals(4).run('hello').passes).toBe(false);
    expect(isString().shorterThanOrEquals(3).run('test').passes).toBe(false);
  });
});
