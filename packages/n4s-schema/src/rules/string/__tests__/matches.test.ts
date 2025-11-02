import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('matches', () => {
  it('pass when string matches regex', () => {
    expect(enforceLazy.isString().matches(/^h/).run('hello').pass).toBe(true);
    expect(enforceLazy.isString().matches(/o$/).run('hello').pass).toBe(true);
    expect(enforceLazy.isString().matches(/\d+/).run('abc123').pass).toBe(true);
  });

  it('pass with string pattern', () => {
    expect(enforceLazy.isString().matches('^h').run('hello').pass).toBe(true);
    expect(enforceLazy.isString().matches('o$').run('hello').pass).toBe(true);
  });

  it('fails when string does not match', () => {
    expect(enforceLazy.isString().matches(/^x/).run('hello').pass).toBe(false);
    expect(enforceLazy.isString().matches(/\d+/).run('hello').pass).toBe(false);
  });
});
