import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('lengthEquals', () => {
  it('pass when string length equals the specified value', () => {
    expect(enforce.isString().lengthEquals(5).run('hello').pass).toBe(true);
    expect(enforce.isString().lengthEquals(0).run('').pass).toBe(true);
    expect(enforce.isString().lengthEquals(3).run('abc').pass).toBe(true);
    expect(enforce.isString().lengthEquals(4).run('test').pass).toBe(true);
  });

  it('fails when string length does not equal the specified value', () => {
    expect(enforce.isString().lengthEquals(3).run('hello').pass).toBe(false);
    expect(enforce.isString().lengthEquals(1).run('').pass).toBe(false);
    expect(enforce.isString().lengthEquals(5).run('test').pass).toBe(false);
  });
});
