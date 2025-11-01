import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isBlank', () => {
  it('passes for empty strings', () => {
    expect(enforceLazy.isString().isBlank().run('').passes).toBe(true);
  });

  it('passes for whitespace-only strings', () => {
    expect(enforceLazy.isString().isBlank().run(' ').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run('  ').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run('\t').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run('\n').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run('\r\n').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run('   \t  \n  ').passes).toBe(
      true,
    );
  });

  it('fails for strings with content', () => {
    expect(enforceLazy.isString().isBlank().run('x').passes).toBe(false);
    expect(enforceLazy.isString().isBlank().run(' x ').passes).toBe(false);
    expect(enforceLazy.isString().isBlank().run('hello').passes).toBe(false);
    expect(enforceLazy.isString().isBlank().run('  text  ').passes).toBe(false);
  });
});
