import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('longerThanOrEquals', () => {
  it('passes when string length is greater than or equal to specified value', () => {
    expect(
      enforceLazy.isString().longerThanOrEquals(5).run('hello').passes,
    ).toBe(true);
    expect(
      enforceLazy.isString().longerThanOrEquals(3).run('hello').passes,
    ).toBe(true);
    expect(enforceLazy.isString().longerThanOrEquals(0).run('').passes).toBe(
      true,
    );
  });

  it('fails when string length is less than specified value', () => {
    expect(
      enforceLazy.isString().longerThanOrEquals(6).run('hello').passes,
    ).toBe(false);
    expect(
      enforceLazy.isString().longerThanOrEquals(5).run('test').passes,
    ).toBe(false);
    expect(enforceLazy.isString().longerThanOrEquals(1).run('').passes).toBe(
      false,
    );
  });
});
