import { describe, expect, it } from 'vitest';

import { isString } from 'stringRules';

describe('stringRules', () => {
  it('should return true when all rules pass', () => {
    expect(isString().endsWith('log').run('catalog').passes).toBe(true);
    expect(isString().startsWith('cat').run('catalog').passes).toBe(true);
    expect(
      isString().startsWith('cat').endsWith('log').run('catalog').passes,
    ).toBe(true);
  });

  it('should return false when any rule fails', () => {
    expect(isString().endsWith('log').run('cat').passes).toBe(false);
    expect(isString().startsWith('dog').run('catalog').passes).toBe(false);
    expect(
      isString().startsWith('cat').endsWith('dog').run('catalog').passes,
    ).toBe(false);
  });

  it('should handle multiple rules', () => {
    expect(isString().minLength(3).maxLength(5).run('four').passes).toBe(true);
    expect(isString().minLength(3).maxLength(5).run('three').passes).toBe(
      false,
    );
    expect(isString().minLength(3).maxLength(5).run('a').passes).toBe(false);
  });

  it('should handle regex matching', () => {
    expect(
      isString()
        .matches(/^[a-z]+$/)
        .run('abc').passes,
    ).toBe(true);
    expect(
      isString()
        .matches(/^[a-z]+$/)
        .run('ab1c').passes,
    ).toBe(false);
  });

  it('should handle complex chaining', () => {
    expect(
      isString()
        .minLength(5)
        .maxLength(10)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end').passes,
    ).toBe(false);
    expect(
      isString()
        .minLength(5)
        .maxLength(20)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end').passes,
    ).toBe(true);
  });
});
