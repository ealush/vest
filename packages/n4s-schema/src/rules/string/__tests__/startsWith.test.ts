import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('startsWith', () => {
  it('pass when string starts with prefix', () => {
    expect(enforceLazy.isString().startsWith('he').run('hello').pass).toBe(
      true,
    );
    expect(enforceLazy.isString().startsWith('').run('hello').pass).toBe(true);
    expect(enforceLazy.isString().startsWith('hel').run('hello').pass).toBe(
      true,
    );
  });

  it('fails when string does not start with prefix', () => {
    expect(enforceLazy.isString().startsWith('x').run('hello').pass).toBe(
      false,
    );
    expect(enforceLazy.isString().startsWith('lo').run('hello').pass).toBe(
      false,
    );
  });
});
