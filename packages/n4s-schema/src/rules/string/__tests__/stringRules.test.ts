import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

describe('stringRules', () => {
  it('should return true when all rules pass', () => {
    expect(enforce.isString().endsWith('log').run('catalog').pass).toBe(true);
    expect(enforce.isString().startsWith('cat').run('catalog').pass).toBe(true);
    expect(
      enforce.isString().startsWith('cat').endsWith('log').run('catalog').pass,
    ).toBe(true);
  });

  it('should return false when any rule fails', () => {
    expect(enforce.isString().endsWith('log').run('cat').pass).toBe(false);
    expect(enforce.isString().startsWith('dog').run('catalog').pass).toBe(
      false,
    );
    expect(
      enforce.isString().startsWith('cat').endsWith('dog').run('catalog').pass,
    ).toBe(false);
  });

  it('should handle multiple rules', () => {
    expect(enforce.isString().minLength(3).maxLength(5).run('four').pass).toBe(
      true,
    );
    expect(
      enforce.isString().minLength(3).maxLength(5).run('more_than_five').pass,
    ).toBe(false);
    expect(enforce.isString().minLength(3).maxLength(5).run('a').pass).toBe(
      false,
    );
    expect(enforce.isString().lengthEquals(4).run('four').pass).toBe(true);
    expect(enforce.isString().lengthNotEquals(4).run('four').pass).toBe(false);
    expect(enforce.isString().longerThan(3).run('four').pass).toBe(true);
    expect(enforce.isString().longerThanOrEquals(4).run('four').pass).toBe(
      true,
    );
    expect(enforce.isString().shorterThan(5).run('four').pass).toBe(true);
    expect(enforce.isString().shorterThanOrEquals(4).run('four').pass).toBe(
      true,
    );
  });

  it('should handle regex matching', () => {
    expect(
      enforce
        .isString()
        .matches(/^[a-z]+$/)
        .run('abc').pass,
    ).toBe(true);
    expect(
      enforce
        .isString()
        .matches(/^[a-z]+$/)
        .run('ab1c').pass,
    ).toBe(false);
    expect(enforce.isString().matches('[a-z]+').run('abc').pass).toBe(true);
    expect(enforce.isString().notMatches('[0-9]+').run('abc').pass).toBe(true);
  });

  it('should handle isBlank / isNotBlank for strings', () => {
    expect(enforce.isString().isBlank().run('   ').pass).toBe(true);
    expect(enforce.isString().isBlank().run('').pass).toBe(true);
    expect(enforce.isString().isBlank().run(' a ').pass).toBe(false);

    expect(enforce.isString().isNotBlank().run('a').pass).toBe(true);
    expect(enforce.isString().isNotBlank().run('   ').pass).toBe(false);
  });

  it('should handle doesNotStartWith / doesNotEndWith', () => {
    expect(enforce.isString().doesNotStartWith('dog').run('catalog').pass).toBe(
      true,
    );
    expect(enforce.isString().doesNotStartWith('cat').run('catalog').pass).toBe(
      false,
    );
    expect(enforce.isString().doesNotEndWith('dog').run('catalog').pass).toBe(
      true,
    );
    expect(enforce.isString().doesNotEndWith('log').run('catalog').pass).toBe(
      false,
    );
  });

  it('inside / notInside with string and array containers', () => {
    // string container
    expect(enforce.isString().inside('hello world').run('world').pass).toBe(
      true,
    );
    expect(enforce.isString().notInside('hello world').run('mars').pass).toBe(
      true,
    );

    // array-of-strings container
    expect(enforce.isString().inside(['red', 'green']).run('red').pass).toBe(
      true,
    );
    expect(
      enforce.isString().notInside(['red', 'green']).run('blue').pass,
    ).toBe(true);
  });

  it('should handle complex chaining', () => {
    expect(
      enforce
        .isString()
        .minLength(5)
        .maxLength(10)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end').pass,
    ).toBe(false);
    expect(
      enforce
        .isString()
        .minLength(5)
        .maxLength(20)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end').pass,
    ).toBe(true);
  });
});
