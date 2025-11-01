import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('startsWith', () => {
  it('passes when string starts with prefix', () => {
    expect(isString().startsWith('he').run('hello').passes).toBe(true);
    expect(isString().startsWith('').run('hello').passes).toBe(true);
    expect(isString().startsWith('hel').run('hello').passes).toBe(true);
  });

  it('fails when string does not start with prefix', () => {
    expect(isString().startsWith('x').run('hello').passes).toBe(false);
    expect(isString().startsWith('lo').run('hello').passes).toBe(false);
  });
});
