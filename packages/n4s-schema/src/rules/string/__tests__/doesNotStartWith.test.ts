import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('doesNotStartWith', () => {
  it('passes when string does not start with prefix', () => {
    expect(enforceLazy.isString().doesNotStartWith('x').run('hello').passes).toBe(true);
    expect(enforceLazy.isString().doesNotStartWith('lo').run('hello').passes).toBe(true);
  });

  it('fails when string starts with prefix', () => {
    expect(enforceLazy.isString().doesNotStartWith('he').run('hello').passes).toBe(false);
    expect(enforceLazy.isString().doesNotStartWith('hel').run('hello').passes).toBe(false);
  });
});
