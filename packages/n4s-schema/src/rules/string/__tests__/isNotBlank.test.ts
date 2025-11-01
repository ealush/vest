import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('isNotBlank', () => {
  it('passes for strings with content', () => {
    expect(isString().isNotBlank().run('x').passes).toBe(true);
    expect(isString().isNotBlank().run('hello').passes).toBe(true);
    expect(isString().isNotBlank().run(' x ').passes).toBe(true);
    expect(isString().isNotBlank().run('  text  ').passes).toBe(true);
  });

  it('fails for empty strings', () => {
    expect(isString().isNotBlank().run('').passes).toBe(false);
  });

  it('fails for whitespace-only strings', () => {
    expect(isString().isNotBlank().run(' ').passes).toBe(false);
    expect(isString().isNotBlank().run('  ').passes).toBe(false);
    expect(isString().isNotBlank().run('\t').passes).toBe(false);
    expect(isString().isNotBlank().run('\n').passes).toBe(false);
    expect(isString().isNotBlank().run('   \t  \n  ').passes).toBe(false);
  });
});
