import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('doesNotEndWith', () => {
  it('passes when string does not end with suffix', () => {
    expect(isString().doesNotEndWith('x').run('hello').passes).toBe(true);
    expect(isString().doesNotEndWith('he').run('hello').passes).toBe(true);
  });

  it('fails when string ends with suffix', () => {
    expect(isString().doesNotEndWith('lo').run('hello').passes).toBe(false);
    expect(isString().doesNotEndWith('llo').run('hello').passes).toBe(false);
  });
});
