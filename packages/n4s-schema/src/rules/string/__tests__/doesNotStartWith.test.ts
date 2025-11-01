import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('doesNotStartWith', () => {
  it('passes when string does not start with prefix', () => {
    expect(isString().doesNotStartWith('x').run('hello').passes).toBe(true);
    expect(isString().doesNotStartWith('lo').run('hello').passes).toBe(true);
  });

  it('fails when string starts with prefix', () => {
    expect(isString().doesNotStartWith('he').run('hello').passes).toBe(false);
    expect(isString().doesNotStartWith('hel').run('hello').passes).toBe(false);
  });
});
