import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('isBlank', () => {
  it('passes for empty strings', () => {
    expect(isString().isBlank().run('').passes).toBe(true);
  });

  it('passes for whitespace-only strings', () => {
    expect(isString().isBlank().run(' ').passes).toBe(true);
    expect(isString().isBlank().run('  ').passes).toBe(true);
    expect(isString().isBlank().run('\t').passes).toBe(true);
    expect(isString().isBlank().run('\n').passes).toBe(true);
    expect(isString().isBlank().run('\r\n').passes).toBe(true);
    expect(isString().isBlank().run('   \t  \n  ').passes).toBe(true);
  });

  it('fails for strings with content', () => {
    expect(isString().isBlank().run('x').passes).toBe(false);
    expect(isString().isBlank().run(' x ').passes).toBe(false);
    expect(isString().isBlank().run('hello').passes).toBe(false);
    expect(isString().isBlank().run('  text  ').passes).toBe(false);
  });
});
