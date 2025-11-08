import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('endsWith', () => {
  it('pass when string ends with suffix', () => {
    expect(enforce.isString().endsWith('lo').run('hello').pass).toBe(true);
    expect(enforce.isString().endsWith('').run('hello').pass).toBe(true);
    expect(enforce.isString().endsWith('llo').run('hello').pass).toBe(true);
  });

  it('fails when string does not end with suffix', () => {
    expect(enforce.isString().endsWith('x').run('hello').pass).toBe(false);
    expect(enforce.isString().endsWith('he').run('hello').pass).toBe(false);
  });
});
