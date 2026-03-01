import { describe, expect, it } from 'vitest';

import { arrayParsers, join, uniq } from '../arrayParsers';

describe('array parsers', () => {
  it('exports all array parser functions', () => {
    expect(Object.keys(arrayParsers).sort()).toEqual(['join', 'uniq']);
  });

  it('join', () => {
    expect(join(['a', 'b', 'c'], '-').type).toBe('a-b-c');
    expect(join(['a', 'b', 'c'], '-').pass).toBe(true);
  });

  it('uniq', () => {
    expect(uniq(['a', 'a', 'b']).type).toEqual(['a', 'b']);
    expect(uniq(['a', 'a', 'b']).pass).toBe(true);
  });
});
