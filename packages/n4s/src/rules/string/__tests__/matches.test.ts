import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('matches', () => {
  it('pass when string matches regex', () => {
    expect(enforce.isString().matches(/^h/).run('hello').pass).toBe(true);
    expect(enforce.isString().matches(/o$/).run('hello').pass).toBe(true);
    expect(enforce.isString().matches(/\d+/).run('abc123').pass).toBe(true);
  });

  it('pass with string pattern', () => {
    expect(enforce.isString().matches('^h').run('hello').pass).toBe(true);
    expect(enforce.isString().matches('o$').run('hello').pass).toBe(true);
  });

  it('fails when string does not match', () => {
    expect(enforce.isString().matches(/^x/).run('hello').pass).toBe(false);
    expect(enforce.isString().matches(/\d+/).run('hello').pass).toBe(false);
  });
});
