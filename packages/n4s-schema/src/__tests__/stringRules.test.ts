import { describe, expect, it } from 'vitest';

import { enforceLazy } from '../lazy';

describe('stringRules', () => {
  it('should return true when all rules pass', () => {
    expect(enforceLazy.isString().endsWith('log').run('catalog').passes).toBe(
      true,
    );
    expect(enforceLazy.isString().startsWith('cat').run('catalog').passes).toBe(
      true,
    );
    expect(
      enforceLazy.isString().startsWith('cat').endsWith('log').run('catalog')
        .passes,
    ).toBe(true);
  });

  it('should return false when any rule fails', () => {
    expect(enforceLazy.isString().endsWith('log').run('cat').passes).toBe(
      false,
    );
    expect(enforceLazy.isString().startsWith('dog').run('catalog').passes).toBe(
      false,
    );
    expect(
      enforceLazy.isString().startsWith('cat').endsWith('dog').run('catalog')
        .passes,
    ).toBe(false);
  });

  it('should handle multiple rules', () => {
    expect(
      enforceLazy.isString().minLength(3).maxLength(5).run('four').passes,
    ).toBe(true);
    expect(
      enforceLazy.isString().minLength(3).maxLength(5).run('more_than_five')
        .passes,
    ).toBe(false);
    expect(
      enforceLazy.isString().minLength(3).maxLength(5).run('a').passes,
    ).toBe(false);
    expect(enforceLazy.isString().lengthEquals(4).run('four').passes).toBe(
      true,
    );
    expect(enforceLazy.isString().lengthNotEquals(4).run('four').passes).toBe(
      false,
    );
    expect(enforceLazy.isString().longerThan(3).run('four').passes).toBe(true);
    expect(
      enforceLazy.isString().longerThanOrEquals(4).run('four').passes,
    ).toBe(true);
    expect(enforceLazy.isString().shorterThan(5).run('four').passes).toBe(true);
    expect(
      enforceLazy.isString().shorterThanOrEquals(4).run('four').passes,
    ).toBe(true);
  });

  it('should handle regex matching', () => {
    expect(
      enforceLazy
        .isString()
        .matches(/^[a-z]+$/)
        .run('abc').passes,
    ).toBe(true);
    expect(
      enforceLazy
        .isString()
        .matches(/^[a-z]+$/)
        .run('ab1c').passes,
    ).toBe(false);
    expect(enforceLazy.isString().matches('[a-z]+').run('abc').passes).toBe(
      true,
    );
    expect(enforceLazy.isString().notMatches('[0-9]+').run('abc').passes).toBe(
      true,
    );
  });

  it('should handle isBlank / isNotBlank for strings', () => {
    expect(enforceLazy.isString().isBlank().run('   ').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run('').passes).toBe(true);
    expect(enforceLazy.isString().isBlank().run(' a ').passes).toBe(false);

    expect(enforceLazy.isString().isNotBlank().run('a').passes).toBe(true);
    expect(enforceLazy.isString().isNotBlank().run('   ').passes).toBe(false);
  });

  it('should handle doesNotStartWith / doesNotEndWith', () => {
    expect(
      enforceLazy.isString().doesNotStartWith('dog').run('catalog').passes,
    ).toBe(true);
    expect(
      enforceLazy.isString().doesNotStartWith('cat').run('catalog').passes,
    ).toBe(false);
    expect(
      enforceLazy.isString().doesNotEndWith('dog').run('catalog').passes,
    ).toBe(true);
    expect(
      enforceLazy.isString().doesNotEndWith('log').run('catalog').passes,
    ).toBe(false);
  });

  it('inside / notInside with string and array containers', () => {
    // string container
    expect(
      enforceLazy.isString().inside('hello world').run('world').passes,
    ).toBe(true);
    expect(
      enforceLazy.isString().notInside('hello world').run('mars').passes,
    ).toBe(true);

    // array-of-strings container
    expect(
      enforceLazy.isString().inside(['red', 'green']).run('red').passes,
    ).toBe(true);
    expect(
      enforceLazy.isString().notInside(['red', 'green']).run('blue').passes,
    ).toBe(true);
  });

  it('should handle complex chaining', () => {
    expect(
      enforceLazy
        .isString()
        .minLength(5)
        .maxLength(10)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end').passes,
    ).toBe(false);
    expect(
      enforceLazy
        .isString()
        .minLength(5)
        .maxLength(20)
        .startsWith('start')
        .endsWith('end')
        .run('start-middle-end').passes,
    ).toBe(true);
  });
});
