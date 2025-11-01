import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('matches', () => {
  it('passes when string matches regex', () => {
    expect(enforceLazy.isString().matches(/^h/).run('hello').passes).toBe(true);
    expect(enforceLazy.isString().matches(/o$/).run('hello').passes).toBe(true);
    expect(enforceLazy.isString().matches(/\d+/).run('abc123').passes).toBe(true);
  });

  it('passes with string pattern', () => {
    expect(enforceLazy.isString().matches('^h').run('hello').passes).toBe(true);
    expect(enforceLazy.isString().matches('o$').run('hello').passes).toBe(true);
  });

  it('fails when string does not match', () => {
    expect(enforceLazy.isString().matches(/^x/).run('hello').passes).toBe(false);
    expect(enforceLazy.isString().matches(/\d+/).run('hello').passes).toBe(false);
  });
});
