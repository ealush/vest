import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('shorterThanOrEquals', () => {
  it('pass when string length is less than or equal to specified value', () => {
    expect(
      enforceLazy.isString().shorterThanOrEquals(5).run('hello').pass,
    ).toBe(true);
    expect(
      enforceLazy.isString().shorterThanOrEquals(6).run('hello').pass,
    ).toBe(true);
    expect(enforceLazy.isString().shorterThanOrEquals(0).run('').pass).toBe(
      true,
    );
  });

  it('fails when string length is greater than specified value', () => {
    expect(
      enforceLazy.isString().shorterThanOrEquals(4).run('hello').pass,
    ).toBe(false);
    expect(enforceLazy.isString().shorterThanOrEquals(3).run('test').pass).toBe(
      false,
    );
  });
});
