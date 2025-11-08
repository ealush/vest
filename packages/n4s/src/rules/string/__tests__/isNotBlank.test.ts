import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isNotBlank', () => {
  it('pass for strings with content', () => {
    expect(enforce.isString().isNotBlank().run('x').pass).toBe(true);
    expect(enforce.isString().isNotBlank().run('hello').pass).toBe(true);
    expect(enforce.isString().isNotBlank().run(' x ').pass).toBe(true);
    expect(enforce.isString().isNotBlank().run('  text  ').pass).toBe(true);
  });

  it('fails for empty strings', () => {
    expect(enforce.isString().isNotBlank().run('').pass).toBe(false);
  });

  it('fails for whitespace-only strings', () => {
    expect(enforce.isString().isNotBlank().run(' ').pass).toBe(false);
    expect(enforce.isString().isNotBlank().run('  ').pass).toBe(false);
    expect(enforce.isString().isNotBlank().run('\t').pass).toBe(false);
    expect(enforce.isString().isNotBlank().run('\n').pass).toBe(false);
    expect(enforce.isString().isNotBlank().run('   \t  \n  ').pass).toBe(false);
  });
});
