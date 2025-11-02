import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('doesNotStartWith', () => {
  it('pass when string does not start with prefix', () => {
    expect(enforceLazy.isString().doesNotStartWith('x').run('hello').pass).toBe(
      true,
    );
    expect(
      enforceLazy.isString().doesNotStartWith('lo').run('hello').pass,
    ).toBe(true);
  });

  it('fails when string starts with prefix', () => {
    expect(
      enforceLazy.isString().doesNotStartWith('he').run('hello').pass,
    ).toBe(false);
    expect(
      enforceLazy.isString().doesNotStartWith('hel').run('hello').pass,
    ).toBe(false);
  });
});
