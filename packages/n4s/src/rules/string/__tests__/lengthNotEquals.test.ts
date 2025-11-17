import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('lengthNotEquals', () => {
  it('pass when string length does not equal the specified value', () => {
    expect(enforce.isString().lengthNotEquals(3).run('hello').pass).toBe(true);
    expect(enforce.isString().lengthNotEquals(1).run('').pass).toBe(true);
    expect(enforce.isString().lengthNotEquals(5).run('test').pass).toBe(true);
    expect(enforce.isString().lengthNotEquals(10).run('abc').pass).toBe(true);
  });

  it('fails when string length equals the specified value', () => {
    expect(enforce.isString().lengthNotEquals(5).run('hello').pass).toBe(false);
    expect(enforce.isString().lengthNotEquals(0).run('').pass).toBe(false);
    expect(enforce.isString().lengthNotEquals(4).run('test').pass).toBe(false);
  });
});
