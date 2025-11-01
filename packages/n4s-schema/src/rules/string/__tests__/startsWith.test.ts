import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('startsWith', () => {
  it('passes when string starts with prefix', () => {
    expect(enforceLazy.isString().startsWith('he').run('hello').passes).toBe(true);
    expect(enforceLazy.isString().startsWith('').run('hello').passes).toBe(true);
    expect(enforceLazy.isString().startsWith('hel').run('hello').passes).toBe(true);
  });

  it('fails when string does not start with prefix', () => {
    expect(enforceLazy.isString().startsWith('x').run('hello').passes).toBe(false);
    expect(enforceLazy.isString().startsWith('lo').run('hello').passes).toBe(false);
  });
});
