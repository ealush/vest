import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('doesNotEndWith', () => {
  it('pass when string does not end with suffix', () => {
    expect(enforce.isString().doesNotEndWith('x').run('hello').pass).toBe(true);
    expect(enforce.isString().doesNotEndWith('he').run('hello').pass).toBe(
      true,
    );
  });

  it('fails when string ends with suffix', () => {
    expect(enforce.isString().doesNotEndWith('lo').run('hello').pass).toBe(
      false,
    );
    expect(enforce.isString().doesNotEndWith('llo').run('hello').pass).toBe(
      false,
    );
  });
});
