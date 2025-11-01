import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('longerThanOrEquals', () => {
  it('passes when string length is greater than or equal to specified value', () => {
    expect(isString().longerThanOrEquals(5).run('hello').passes).toBe(true);
    expect(isString().longerThanOrEquals(3).run('hello').passes).toBe(true);
    expect(isString().longerThanOrEquals(0).run('').passes).toBe(true);
  });

  it('fails when string length is less than specified value', () => {
    expect(isString().longerThanOrEquals(6).run('hello').passes).toBe(false);
    expect(isString().longerThanOrEquals(5).run('test').passes).toBe(false);
    expect(isString().longerThanOrEquals(1).run('').passes).toBe(false);
  });
});
