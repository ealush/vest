import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('notMatches', () => {
  it('pass when string does not match regex', () => {
    expect(enforceLazy.isString().notMatches(/^x/).run('hello').pass).toBe(
      true,
    );
    expect(enforceLazy.isString().notMatches(/\d+/).run('hello').pass).toBe(
      true,
    );
  });

  it('pass with string pattern', () => {
    expect(enforceLazy.isString().notMatches('^x').run('hello').pass).toBe(
      true,
    );
    expect(enforceLazy.isString().notMatches('\\d+').run('hello').pass).toBe(
      true,
    );
  });

  it('fails when string matches', () => {
    expect(enforceLazy.isString().notMatches(/^h/).run('hello').pass).toBe(
      false,
    );
    expect(enforceLazy.isString().notMatches(/o$/).run('hello').pass).toBe(
      false,
    );
  });
});
