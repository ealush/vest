import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('endsWith', () => {
  it('pass when string ends with suffix', () => {
    expect(enforceLazy.isString().endsWith('lo').run('hello').pass).toBe(true);
    expect(enforceLazy.isString().endsWith('').run('hello').pass).toBe(true);
    expect(enforceLazy.isString().endsWith('llo').run('hello').pass).toBe(true);
  });

  it('fails when string does not end with suffix', () => {
    expect(enforceLazy.isString().endsWith('x').run('hello').pass).toBe(false);
    expect(enforceLazy.isString().endsWith('he').run('hello').pass).toBe(false);
  });
});
