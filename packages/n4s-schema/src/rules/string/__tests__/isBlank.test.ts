import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isBlank', () => {
  it('pass for empty strings', () => {
    expect(enforceLazy.isString().isBlank().run('').pass).toBe(true);
  });

  it('pass for whitespace-only strings', () => {
    expect(enforceLazy.isString().isBlank().run(' ').pass).toBe(true);
    expect(enforceLazy.isString().isBlank().run('  ').pass).toBe(true);
    expect(enforceLazy.isString().isBlank().run('\t').pass).toBe(true);
    expect(enforceLazy.isString().isBlank().run('\n').pass).toBe(true);
    expect(enforceLazy.isString().isBlank().run('\r\n').pass).toBe(true);
    expect(enforceLazy.isString().isBlank().run('   \t  \n  ').pass).toBe(true);
  });

  it('fails for strings with content', () => {
    expect(enforceLazy.isString().isBlank().run('x').pass).toBe(false);
    expect(enforceLazy.isString().isBlank().run(' x ').pass).toBe(false);
    expect(enforceLazy.isString().isBlank().run('hello').pass).toBe(false);
    expect(enforceLazy.isString().isBlank().run('  text  ').pass).toBe(false);
  });
});
