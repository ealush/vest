import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('notMatches', () => {
  it('passes when string does not match regex', () => {
    expect(isString().notMatches(/^x/).run('hello').passes).toBe(true);
    expect(isString().notMatches(/\d+/).run('hello').passes).toBe(true);
  });

  it('passes with string pattern', () => {
    expect(isString().notMatches('^x').run('hello').passes).toBe(true);
    expect(isString().notMatches('\\d+').run('hello').passes).toBe(true);
  });

  it('fails when string matches', () => {
    expect(isString().notMatches(/^h/).run('hello').passes).toBe(false);
    expect(isString().notMatches(/o$/).run('hello').passes).toBe(false);
  });
});
