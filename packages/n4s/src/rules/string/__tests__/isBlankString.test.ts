import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isBlank', () => {
  it('pass for empty strings', () => {
    expect(enforce.isString().isBlank().run('').pass).toBe(true);
  });

  it('pass for whitespace-only strings', () => {
    expect(enforce.isString().isBlank().run(' ').pass).toBe(true);
    expect(enforce.isString().isBlank().run('  ').pass).toBe(true);
    expect(enforce.isString().isBlank().run('\t').pass).toBe(true);
    expect(enforce.isString().isBlank().run('\n').pass).toBe(true);
    expect(enforce.isString().isBlank().run('\r\n').pass).toBe(true);
    expect(enforce.isString().isBlank().run('   \t  \n  ').pass).toBe(true);
  });

  it('fails for strings with content', () => {
    expect(enforce.isString().isBlank().run('x').pass).toBe(false);
    expect(enforce.isString().isBlank().run(' x ').pass).toBe(false);
    expect(enforce.isString().isBlank().run('hello').pass).toBe(false);
    expect(enforce.isString().isBlank().run('  text  ').pass).toBe(false);
  });
});
