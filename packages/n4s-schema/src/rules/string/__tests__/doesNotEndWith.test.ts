import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('doesNotEndWith', () => {
  it('pass when string does not end with suffix', () => {
    expect(enforceLazy.isString().doesNotEndWith('x').run('hello').pass).toBe(
      true,
    );
    expect(enforceLazy.isString().doesNotEndWith('he').run('hello').pass).toBe(
      true,
    );
  });

  it('fails when string ends with suffix', () => {
    expect(enforceLazy.isString().doesNotEndWith('lo').run('hello').pass).toBe(
      false,
    );
    expect(enforceLazy.isString().doesNotEndWith('llo').run('hello').pass).toBe(
      false,
    );
  });
});
