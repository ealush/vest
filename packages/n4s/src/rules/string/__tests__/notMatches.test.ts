import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('notMatches', () => {
  it('pass when string does not match regex', () => {
    expect(enforce.isString().notMatches(/^x/).run('hello').pass).toBe(true);
    expect(enforce.isString().notMatches(/\d+/).run('hello').pass).toBe(true);
  });

  it('pass with string pattern', () => {
    expect(enforce.isString().notMatches('^x').run('hello').pass).toBe(true);
    expect(enforce.isString().notMatches('\\d+').run('hello').pass).toBe(true);
  });

  it('fails when string matches', () => {
    expect(enforce.isString().notMatches(/^h/).run('hello').pass).toBe(false);
    expect(enforce.isString().notMatches(/o$/).run('hello').pass).toBe(false);
  });
});
