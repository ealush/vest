import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('doesNotEndWith', () => {
  it('passes when string does not end with suffix', () => {
    expect(enforceLazy.isString().doesNotEndWith('x').run('hello').passes).toBe(
      true,
    );
    expect(
      enforceLazy.isString().doesNotEndWith('he').run('hello').passes,
    ).toBe(true);
  });

  it('fails when string ends with suffix', () => {
    expect(
      enforceLazy.isString().doesNotEndWith('lo').run('hello').passes,
    ).toBe(false);
    expect(
      enforceLazy.isString().doesNotEndWith('llo').run('hello').passes,
    ).toBe(false);
  });
});
