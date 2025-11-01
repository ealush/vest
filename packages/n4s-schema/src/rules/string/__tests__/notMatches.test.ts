import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('notMatches', () => {
  it('passes when string does not match regex', () => {
    expect(enforceLazy.isString().notMatches(/^x/).run('hello').passes).toBe(
      true,
    );
    expect(enforceLazy.isString().notMatches(/\d+/).run('hello').passes).toBe(
      true,
    );
  });

  it('passes with string pattern', () => {
    expect(enforceLazy.isString().notMatches('^x').run('hello').passes).toBe(
      true,
    );
    expect(enforceLazy.isString().notMatches('\\d+').run('hello').passes).toBe(
      true,
    );
  });

  it('fails when string matches', () => {
    expect(enforceLazy.isString().notMatches(/^h/).run('hello').passes).toBe(
      false,
    );
    expect(enforceLazy.isString().notMatches(/o$/).run('hello').passes).toBe(
      false,
    );
  });
});
