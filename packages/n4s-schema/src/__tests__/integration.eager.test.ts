import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('Eager API - Integration Tests', () => {
  describe('Basic behavior', () => {
    it('throws when a rule fails', () => {
      expect(() => enforce([]).isString()).toThrow();
      expect(() => enforce(1).greaterThan(1)).toThrow();
      expect(() => enforce('hi').matches(/[0-9]/)).toThrow();
    });

    it('returns silently when rule passes', () => {
      enforce(1).isNumber();
      enforce(1).greaterThan(0);
      enforce('1984').matches(/[0-9]/);
    });

    it('includes a helpful failure message (rule name and value)', () => {
      expect(() => enforce('a').greaterThan('b')).toThrow(
        /enforce\/greaterThan failed with "a"/,
      );
      expect(() => enforce(['x']).shorterThan(0)).toThrow(
        /enforce\/shorterThan failed with \["x"\]/,
      );
    });
  });

  describe('Chaining', () => {
    it('chains rules of the same type', () => {
      // String chaining
      enforce('hello')
        .isString()
        .longerThan(2)
        .shorterThan(10)
        .matches(/^h/)
        .startsWith('he');

      // Number chaining
      enforce(5).isNumber().greaterThan(0).lessThan(10).isOdd();

      // Array chaining
      enforce([1, 2, 3]).isArray().lengthEquals(3).isNotEmpty();
    });

    it('chains across different rule categories', () => {
      // Mix type checks with value checks
      enforce('hello').isString().isNotEmpty().longerThan(3);
      enforce(42).isNumber().isPositive().isEven();
      enforce([1, 2]).isArray().longerThan(1).includes(1);
    });

    it('stops at the first failing rule in a chain', () => {
      // After first failure, a throw occurs; later rules are not evaluated
      expect(() => enforce('a').isString().equals('a').lessThan('a')).toThrow();

      expect(() =>
        enforce(5).isNumber().greaterThan(10).lessThan(20),
      ).toThrow(); // fails at greaterThan(10)
    });

    it('handles complex real-world validation chains', () => {
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

  describe('Type coercion and comparisons', () => {
    it('handles numeric coercion', () => {
      enforce('10').isNumeric().greaterThan(5);
      enforce(900).greaterThan('100');
      enforce('42').numberEquals(42);
    });

    it('handles strict equality', () => {
      enforce(1).equals(1);
      enforce('hello').equals('hello');

      const a = [1, 2, 3];
      enforce(a).equals(a);

      expect(() => enforce('1').equals(1)).toThrow();
      expect(() => enforce([1, 2, 3]).equals([1, 2, 3])).toThrow();
    });
  });

  describe('Truthiness and emptiness', () => {
    it('validates truthy values', () => {
      enforce('hi').isTruthy();
      enforce(1).isTruthy();
      enforce([]).isTruthy();
      enforce({}).isTruthy();

      expect(() => enforce(0).isTruthy()).toThrow();
      expect(() => enforce('').isTruthy()).toThrow();
      expect(() => enforce(null).isTruthy()).toThrow();
    });

    it('validates falsy values', () => {
      enforce('').isFalsy();
      enforce(0).isFalsy();
      enforce(false).isFalsy();
      enforce(null).isFalsy();
      enforce(undefined).isFalsy();
      enforce(NaN).isFalsy();

      expect(() => enforce(1).isFalsy()).toThrow();
      expect(() => enforce('hi').isFalsy()).toThrow();
    });

    it('validates empty and non-empty', () => {
      enforce('').isEmpty();
      enforce([]).isEmpty();

      enforce('text').isNotEmpty();
      enforce([1]).isNotEmpty();

      expect(() => enforce('text').isEmpty()).toThrow();
      expect(() => enforce('').isNotEmpty()).toThrow();
    });
  });

  describe('Object membership', () => {
    it('validates key membership', () => {
      const obj = { a: 1, b: 2, c: 3 };
      enforce('a').isKeyOf(obj);
      enforce('z').isNotKeyOf(obj);
    });

    it('validates value membership', () => {
      const obj = { a: 1, b: 2, c: 3 } as const;
      enforce(1).isValueOf(obj);
      enforce(4).isNotValueOf(obj);
    });
  });

  describe('Container membership', () => {
    it('validates string contains substring', () => {
      enforce('a').inside('cat');
      enforce('at').inside('cat');
      enforce('da').inside('tru dat.');

      expect(() => enforce('ad').inside('tru dat.')).toThrow();
      expect(() => enforce('x').inside('cat')).toThrow();
    });

    it('validates array contains element', () => {
      enforce('x').inside(['x', 'y', 'z']);
      enforce(1).inside([1, 2, 3]);
      enforce(['x', 'y']).inside(['x', 'y', 'z']);

      expect(() => enforce('w').inside(['x', 'y', 'z'])).toThrow();
      expect(() => enforce(4).inside([1, 2, 3])).toThrow();
    });

    it('validates notInside', () => {
      enforce('ad').notInside('tru dat.');
      enforce('w').notInside(['x', 'y', 'z']);
      enforce(['x', 'w']).notInside(['x', 'y', 'z']);

      expect(() => enforce('x').notInside(['x', 'y', 'z'])).toThrow();
      expect(() => enforce('da').notInside('tru dat.')).toThrow();
    });
  });

  describe('Array includes', () => {
    it('validates array includes element', () => {
      enforce([1, 2, 3]).includes(1);
      enforce([1, 2, 3]).includes(2);
      enforce(['a', 'b', 'c']).includes('b');

      expect(() => enforce([1, 2, 3]).includes(4)).toThrow();
      expect(() => enforce(['a', 'b']).includes('c')).toThrow();
      expect(() => enforce([]).includes(1)).toThrow();
    });
  });

  describe('Edge cases with falsy values', () => {
    it('handles falsy values correctly', () => {
      enforce(0).equals(0);
      enforce(false).equals(false);
      enforce('').equals('');
      enforce(null).equals(null);
      enforce(undefined).equals(undefined);

      enforce(0).isFalsy();
      enforce(false).isFalsy();
      enforce('').isFalsy();
    });

    it('distinguishes between different falsy types', () => {
      enforce(null).isNull();
      enforce(undefined).isUndefined();
      enforce(null).isNullish();
      enforce(undefined).isNullish();

      expect(() => enforce(0).isNull()).toThrow();
      expect(() => enforce('').isNullish()).toThrow();
      expect(() => enforce(false).isNullish()).toThrow();
    });
  });

  describe('Type assertions', () => {
    it('validates all basic types', () => {
      enforce('text').isString();
      enforce(42).isNumber();
      enforce(true).isBoolean();
      enforce([]).isArray();
      enforce(NaN).isNaN();

      expect(() => enforce('42').isNumber()).toThrow();
      expect(() => enforce(42).isString()).toThrow();
      expect(() => enforce('true').isBoolean()).toThrow();
      expect(() => enforce({}).isArray()).toThrow();
    });

    it('validates negative type checks', () => {
      enforce('text').isNotNumber();
      enforce(42).isNotString();
      enforce(true).isNotArray();
      enforce(42).isNotNaN();

      expect(() => enforce(42).isNotNumber()).toThrow();
      expect(() => enforce('text').isNotString()).toThrow();
      expect(() => enforce(NaN).isNotNaN()).toThrow();
    });
  });
});
