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
    expect(isString().lengthEquals(4).run('four').passes).toBe(true);
    expect(isString().lengthNotEquals(4).run('four').passes).toBe(false);
    expect(isString().longerThan(3).run('four').passes).toBe(true);
    expect(isString().longerThanOrEquals(4).run('four').passes).toBe(true);
    expect(isString().shorterThan(5).run('four').passes).toBe(true);
    expect(isString().shorterThanOrEquals(4).run('four').passes).toBe(true);
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
    expect(isString().matches('[a-z]+').run('abc').passes).toBe(true);
    expect(isString().notMatches('[0-9]+').run('abc').passes).toBe(true);
  });

  it('should handle isBlank / isNotBlank for strings', () => {
    expect(isString().isBlank().run('   ').passes).toBe(true);
    expect(isString().isBlank().run('').passes).toBe(true);
    expect(isString().isBlank().run(' a ').passes).toBe(false);

    expect(isString().isNotBlank().run('a').passes).toBe(true);
    expect(isString().isNotBlank().run('   ').passes).toBe(false);
  });

  it('should handle doesNotStartWith / doesNotEndWith', () => {
    expect(isString().doesNotStartWith('dog').run('catalog').passes).toBe(true);
    expect(isString().doesNotStartWith('cat').run('catalog').passes).toBe(
      false,
    );
    expect(isString().doesNotEndWith('dog').run('catalog').passes).toBe(true);
    expect(isString().doesNotEndWith('log').run('catalog').passes).toBe(false);
  });

  it('inside / notInside with string and array containers', () => {
    // string container
    expect(isString().inside('hello world').run('world').passes).toBe(true);
    expect(isString().notInside('hello world').run('mars').passes).toBe(true);

    // array-of-strings container
    expect(isString().inside(['red', 'green']).run('red').passes).toBe(true);
    expect(isString().notInside(['red', 'green']).run('blue').passes).toBe(
      true,
    );
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
