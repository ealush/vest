import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('endsWith', () => {
  it('passes when string ends with suffix', () => {
    expect(isString().endsWith('lo').run('hello').passes).toBe(true);
    expect(isString().endsWith('').run('hello').passes).toBe(true);
    expect(isString().endsWith('llo').run('hello').passes).toBe(true);
  });

  it('fails when string does not end with suffix', () => {
    expect(isString().endsWith('x').run('hello').passes).toBe(false);
    expect(isString().endsWith('he').run('hello').passes).toBe(false);
  });
});
