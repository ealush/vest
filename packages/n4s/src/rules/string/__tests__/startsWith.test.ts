import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('startsWith', () => {
  it('pass when string starts with prefix', () => {
    expect(enforce.isString().startsWith('he').run('hello').pass).toBe(true);
    expect(enforce.isString().startsWith('').run('hello').pass).toBe(true);
    expect(enforce.isString().startsWith('hel').run('hello').pass).toBe(true);
  });

  it('fails when string does not start with prefix', () => {
    expect(enforce.isString().startsWith('x').run('hello').pass).toBe(false);
    expect(enforce.isString().startsWith('lo').run('hello').pass).toBe(false);
  });
});
