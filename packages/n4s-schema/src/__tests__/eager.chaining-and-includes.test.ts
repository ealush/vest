import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('eager: chaining and includes', () => {
  describe('object key/value membership', () => {
    it('isKeyOf / isNotKeyOf', () => {
      const o = { a: 1, b: 2, c: 3 };
      enforce('a').isKeyOf(o);
      enforce('z').isNotKeyOf(o);
    });

    it('isValueOf / isNotValueOf', () => {
      const o = { a: 1, b: 2, c: 3 } as const;
      enforce(1).isValueOf(o);
      enforce(4).isNotValueOf(o);
    });
  });

  describe('chaining across categories', () => {
    it('mix string checks with length and membership', () => {
      enforce('cat')
        .isString()
        .longerThan(2)
        .startsWith('c')
        .inside('concatenate');

      enforce('hello')
        .isString()
        .lengthEquals(5)
        .startsWith('he')
        .endsWith('lo')
        .matches(/[a-z]+/);
    });

    it('mix numeric string with numeric comparisons', () => {
      enforce('42')
        .isNumeric()
        .greaterThan(10)
        .lessThan(100)
        .numberEquals('42');

      enforce(50).isNumber().greaterThan(0).lessThan(100).isEven().isPositive();
    });

    it('chain array checks', () => {
      enforce([1, 2, 3]).isArray().lengthEquals(3).longerThan(2);

      enforce(['a', 'b']).isArray().isNotEmpty().shorterThan(5);
    });

    it('chain boolean checks', () => {
      enforce(true).isBoolean().isTrue().isTruthy().equals(true);

      enforce(false).isBoolean().isFalse().isFalsy();
    });

    it('unsupported chain should fail where appropriate', () => {
      // length operators on non-lengthable types
      expect(() => enforce(123 as any).longerThan(2)).toThrow();
      expect(() => enforce(true as any).lengthEquals(1)).toThrow();

      // regex on non-string/number
      expect(() => enforce({} as any).matches(/x/)).toThrow();
      expect(() => enforce([] as any).matches(/x/)).toThrow();

      // numeric comparisons on non-numeric
      expect(() => enforce('x' as any).greaterThan(1)).toThrow();
      expect(() => enforce([] as any).lessThan(5)).toThrow();
    });

    it('stops at the first failing rule in a chain', () => {
      // After first failure, a throw occurs; later rules should not be evaluated.
      expect(() => enforce('a').isString().equals('a').lessThan('a')).toThrow();

      expect(() =>
        enforce(5).isNumber().greaterThan(10).lessThan(20),
      ).toThrow(); // fails at greaterThan(10)
    });

    it('complex real-world validation chains', () => {
      // Username validation
      enforce('john_doe_123')
        .isString()
        .isNotEmpty()
        .longerThan(5)
        .shorterThan(20)
        .matches(/^[a-zA-Z0-9_]+$/);

      // Price validation
      enforce(99.99).isNumber().isPositive().greaterThan(0).lessThan(1000);

      // Email-like string validation
      enforce('test@example.com')
        .isString()
        .isNotEmpty()
        .matches(/@/)
        .matches(/\./)
        .longerThan(5);
    });
  });

  it('array includes', () => {
    // includes checks if array contains an element
    enforce([1, 2, 3]).includes(1);
    enforce([1, 2, 3]).includes(2);
    enforce(['a', 'b', 'c']).includes('b');

    expect(() => enforce([1, 2, 3]).includes(4)).toThrow();
    expect(() => enforce(['a', 'b']).includes('c')).toThrow();
    expect(() => enforce([]).includes(1)).toThrow();
  });
});
