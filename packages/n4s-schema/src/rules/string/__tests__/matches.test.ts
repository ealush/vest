import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('matches', () => {
  it('passes when string matches regex', () => {
    expect(isString().matches(/^h/).run('hello').passes).toBe(true);
    expect(isString().matches(/o$/).run('hello').passes).toBe(true);
    expect(isString().matches(/\d+/).run('abc123').passes).toBe(true);
  });

  it('passes with string pattern', () => {
    expect(isString().matches('^h').run('hello').passes).toBe(true);
    expect(isString().matches('o$').run('hello').passes).toBe(true);
  });

  it('fails when string does not match', () => {
    expect(isString().matches(/^x/).run('hello').passes).toBe(false);
    expect(isString().matches(/\d+/).run('hello').passes).toBe(false);
  });
});
