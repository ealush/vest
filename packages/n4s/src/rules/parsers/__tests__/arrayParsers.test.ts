import { describe, expect, it } from 'vitest';

import { arrayParsers, join, uniq } from '../arrayParsers';

describe('array parsers', () => {
  it('exports all array parser functions', () => {
    expect(Object.keys(arrayParsers).sort()).toEqual(['join', 'uniq']);
  });

  it('join', () => {
    expect(join(['a', 'b', 'c'], '-').type).toBe('a-b-c');
  });

  it('uniq', () => {
    expect(uniq(['a', 'a', 'b']).type).toEqual(['a', 'b']);
  });
});
