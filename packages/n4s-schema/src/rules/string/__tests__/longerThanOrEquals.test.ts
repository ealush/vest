import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('longerThanOrEquals', () => {
  it('pass when string length is greater than or equal to specified value', () => {
    expect(enforce.isString().longerThanOrEquals(5).run('hello').pass).toBe(
      true,
    );
    expect(enforce.isString().longerThanOrEquals(3).run('hello').pass).toBe(
      true,
    );
    expect(enforce.isString().longerThanOrEquals(0).run('').pass).toBe(true);
  });

  it('fails when string length is less than specified value', () => {
    expect(enforce.isString().longerThanOrEquals(6).run('hello').pass).toBe(
      false,
    );
    expect(enforce.isString().longerThanOrEquals(5).run('test').pass).toBe(
      false,
    );
    expect(enforce.isString().longerThanOrEquals(1).run('').pass).toBe(false);
  });
});
