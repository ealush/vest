import { describe, expect, it } from 'vitest';

import { stringRules } from 'stringRules';

describe('stringRules', () => {
  it('should return true when all rules pass', () => {
    expect(stringRules.isString().endsWith('log').run('catalog')).toBe(true);
    expect(stringRules.isString().startsWith('cat').run('catalog')).toBe(true);
    expect(
      stringRules.isString().startsWith('cat').endsWith('log').run('catalog'),
    ).toBe(true);
  });

  it('should return false when any rule fails', () => {
    expect(stringRules.isString().endsWith('log').run('cat')).toBe(false);
    expect(stringRules.isString().startsWith('dog').run('catalog')).toBe(false);
    expect(
      stringRules.isString().startsWith('cat').endsWith('dog').run('catalog'),
    ).toBe(false);
  });

  it('should handle multiple rules', () => {
    expect(stringRules.isString().minLength(3).maxLength(5).run('four')).toBe(
      true,
    );
    expect(stringRules.isString().minLength(3).maxLength(5).run('three')).toBe(
      false,
    );
    expect(stringRules.isString().minLength(3).maxLength(5).run('a')).toBe(
      false,
    );
  });

  it('should handle regex matching', () => {
    expect(
      stringRules
        .isString()
        .matches(/^[a-z]+$/)
        .run('abc'),
    ).toBe(true);
    expect(
      stringRules
        .isString()
        .matches(/^[a-z]+$/)
        .run('ab1c'),
    ).toBe(false);
  });

  it('should handle complex chaining', () => {
    expect(
      stringRules
        .isString()
        .minLength(5)
        .maxLength(10)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end'),
    ).toBe(false);
    expect(
      stringRules
        .isString()
        .minLength(5)
        .maxLength(20)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end'),
    ).toBe(true);
  });
});
