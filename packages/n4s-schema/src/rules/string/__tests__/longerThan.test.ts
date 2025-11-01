import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('longerThan', () => {
  it('passes when string length is greater than specified value', () => {
    expect(isString().longerThan(2).run('hello').passes).toBe(true);
    expect(isString().longerThan(0).run('a').passes).toBe(true);
    expect(isString().longerThan(3).run('test').passes).toBe(true);
  });

  it('fails when string length is not greater', () => {
    expect(isString().longerThan(5).run('hello').passes).toBe(false);
    expect(isString().longerThan(5).run('hi').passes).toBe(false);
    expect(isString().longerThan(0).run('').passes).toBe(false);
  });
});
