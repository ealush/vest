import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNotBlank', () => {
  it('passes for strings with content', () => {
    expect(enforceLazy.isString().isNotBlank().run('x').passes).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run('hello').passes).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run(' x ').passes).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run('  text  ').passes).toBe(true);
  });

  it('fails for empty strings', () => {
    expect(enforceLazy.isString().isNotBlank().run('').passes).toBe(false);
  });

  it('fails for whitespace-only strings', () => {
    expect(enforceLazy.isString().isNotBlank().run(' ').passes).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('  ').passes).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('\t').passes).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('\n').passes).toBe(false);
    expect(enforceLazy.isString().isNotBlank().run('   \t  \n  ').passes).toBe(false);
  });
});
