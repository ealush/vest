import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('lengthNotEquals', () => {
  it('passes when string length does not equal the specified value', () => {
    expect(isString().lengthNotEquals(3).run('hello').passes).toBe(true);
    expect(isString().lengthNotEquals(1).run('').passes).toBe(true);
    expect(isString().lengthNotEquals(5).run('test').passes).toBe(true);
    expect(isString().lengthNotEquals(10).run('abc').passes).toBe(true);
  });

  it('fails when string length equals the specified value', () => {
    expect(isString().lengthNotEquals(5).run('hello').passes).toBe(false);
    expect(isString().lengthNotEquals(0).run('').passes).toBe(false);
    expect(isString().lengthNotEquals(4).run('test').passes).toBe(false);
  });
});
