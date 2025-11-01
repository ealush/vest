import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('endsWith', () => {
  it('passes when string ends with suffix', () => {
    expect(enforceLazy.isString().endsWith('lo').run('hello').passes).toBe(
      true,
    );
    expect(enforceLazy.isString().endsWith('').run('hello').passes).toBe(true);
    expect(enforceLazy.isString().endsWith('llo').run('hello').passes).toBe(
      true,
    );
  });

  it('fails when string does not end with suffix', () => {
    expect(enforceLazy.isString().endsWith('x').run('hello').passes).toBe(
      false,
    );
    expect(enforceLazy.isString().endsWith('he').run('hello').passes).toBe(
      false,
    );
  });
});
