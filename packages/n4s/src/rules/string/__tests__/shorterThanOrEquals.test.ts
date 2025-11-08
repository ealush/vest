import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('shorterThanOrEquals', () => {
  it('pass when string length is less than or equal to specified value', () => {
    expect(enforce.isString().shorterThanOrEquals(5).run('hello').pass).toBe(
      true,
    );
    expect(enforce.isString().shorterThanOrEquals(6).run('hello').pass).toBe(
      true,
    );
    expect(enforce.isString().shorterThanOrEquals(0).run('').pass).toBe(true);
  });

  it('fails when string length is greater than specified value', () => {
    expect(enforce.isString().shorterThanOrEquals(4).run('hello').pass).toBe(
      false,
    );
    expect(enforce.isString().shorterThanOrEquals(3).run('test').pass).toBe(
      false,
    );
  });
});
