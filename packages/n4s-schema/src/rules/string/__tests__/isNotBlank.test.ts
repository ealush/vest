import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotBlank', () => {
  it('pass for strings with content', () => {
    expect(enforceLazy.isString().isNotBlank().run('x').pass).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run('hello').pass).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run(' x ').pass).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run('  text  ').pass).toBe(true);
  });

  it('fails for empty strings', () => {
    expect(enforceLazy.isString().isNotBlank().run('').pass).toBe(false);
  });

  it('fails for whitespace-only strings', () => {
    expect(enforceLazy.isString().isNotBlank().run(' ').pass).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('  ').pass).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('\t').pass).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('\n').pass).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('   \t  \n  ').pass).toBe(
      false,
    );
  });
});
