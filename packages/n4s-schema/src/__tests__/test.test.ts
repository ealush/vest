import { describe, it, expect, beforeEach } from 'vitest';

import { enforce } from 'n4s-schema';

describe('enforce.test() - Lazy API Boolean Return', () => {
  describe('Basic type validation', () => {
    it('Should return true for valid types', () => {
      expect(enforce.isNumber().test(1)).toBe(true);
      expect(enforce.isString().test('hello')).toBe(true);
      expect(enforce.isBoolean().test(true)).toBe(true);
      expect(enforce.isArray().test([])).toBe(true);
    });

    it('Should return false for invalid types', () => {
      expect(enforce.isNumber().test('1')).toBe(false);
      expect(enforce.isString().test(123)).toBe(false);
      expect(enforce.isBoolean().test('true')).toBe(false);
      expect(enforce.isArray().test({})).toBe(false);
    });
  });

  describe('Comparison rules', () => {
    it('Should return true for valid comparisons', () => {
      expect(enforce.isNumber().greaterThan(5).test(6)).toBe(true);
      expect(enforce.isNumber().lessThan(10).test(5)).toBe(true);
      expect(enforce.equals(42).test(42)).toBe(true);
      expect(enforce.notEquals(1).test(2)).toBe(true);
    });

    it('Should return false for invalid comparisons', () => {
      expect(enforce.isNumber().greaterThan(10).test(5)).toBe(false);
      expect(enforce.isNumber().lessThan(5).test(10)).toBe(false);
      expect(enforce.equals(42).test(41)).toBe(false);
      expect(enforce.notEquals(1).test(1)).toBe(false);
    });
  });

  describe('Chained rules', () => {
    it('Should return true when all chained rules pass', () => {
      expect(enforce.isNumber().greaterThan(0).lessThan(10).test(5)).toBe(true);
      expect(
        enforce.isString().longerThan(2).shorterThan(10).test('hello'),
      ).toBe(true);
    });

    it('Should return false when any chained rule fails', () => {
      expect(enforce.isNumber().greaterThan(10).lessThan(20).test(5)).toBe(
        false,
      );
      expect(enforce.isString().longerThan(10).test('short')).toBe(false);
    });

    it('Should short-circuit on first failure', () => {
      // Even if later rules would also fail, should return false on first failure
      expect(
        enforce.isNumber().greaterThan(100).lessThan(50).test('not a number'),
      ).toBe(false);
    });
  });

  describe('String rules', () => {
    it('Should validate string operations', () => {
      expect(enforce.isString().startsWith('hello').test('hello world')).toBe(
        true,
      );
      expect(enforce.isString().endsWith('world').test('hello world')).toBe(
        true,
      );
      expect(enforce.isString().matches(/\d+/).test('abc123')).toBe(true);
      expect(enforce.isEmpty().test('')).toBe(true);
      expect(enforce.isNotEmpty().test('text')).toBe(true);
    });

    it('Should return false for invalid string operations', () => {
      expect(enforce.isString().startsWith('bye').test('hello world')).toBe(
        false,
      );
      expect(enforce.isString().endsWith('hello').test('hello world')).toBe(
        false,
      );
      expect(enforce.isString().matches(/\d+/).test('abc')).toBe(false);
      expect(enforce.isEmpty().test('text')).toBe(false);
      expect(enforce.isNotEmpty().test('')).toBe(false);
    });
  });

  describe('Array rules', () => {
    it('Should validate array operations', () => {
      expect(enforce.isArray().lengthEquals(3).test([1, 2, 3])).toBe(true);
      expect(enforce.isArray().longerThan(2).test([1, 2, 3])).toBe(true);
      expect(enforce.isArray().shorterThan(5).test([1, 2, 3])).toBe(true);
    });

    it('Should return false for invalid array operations', () => {
      expect(enforce.isArray().lengthEquals(5).test([1, 2, 3])).toBe(false);
      expect(enforce.isArray().longerThan(5).test([1, 2, 3])).toBe(false);
      expect(enforce.isArray().shorterThan(2).test([1, 2, 3])).toBe(false);
    });
  });

  describe('Nullish rules', () => {
    it('Should validate nullish values', () => {
      expect(enforce.isNull().test(null)).toBe(true);
      expect(enforce.isUndefined().test(undefined)).toBe(true);
      expect(enforce.isNullish().test(null)).toBe(true);
      expect(enforce.isNullish().test(undefined)).toBe(true);
      expect(enforce.isNotNullish().test('value')).toBe(true);
    });

    it('Should return false for non-nullish checks', () => {
      expect(enforce.isNull().test('not null')).toBe(false);
      expect(enforce.isUndefined().test(null)).toBe(false);
      expect(enforce.isNullish().test('value')).toBe(false);
      expect(enforce.isNotNullish().test(null)).toBe(false);
    });
  });

  describe('Schema rules', () => {
    it('Should validate shape', () => {
      expect(
        enforce
          .shape({
            name: enforce.isString(),
            age: enforce.isNumber(),
          })
          .test({ name: 'John', age: 30 }),
      ).toBe(true);

      expect(
        enforce
          .shape({
            name: enforce.isString(),
            age: enforce.isNumber(),
          })
          .test({ name: 'John', age: '30' }),
      ).toBe(false);
    });

    it('Should validate loose shape', () => {
      expect(
        enforce
          .loose({
            name: enforce.isString(),
          })
          .test({ name: 'John', extra: 'field' }),
      ).toBe(true);

      expect(
        enforce
          .loose({
            name: enforce.isString(),
          })
          .test({ name: 123 }),
      ).toBe(false);
    });

    it('Should validate isArrayOf', () => {
      expect(enforce.isArrayOf(enforce.isNumber()).test([1, 2, 3])).toBe(true);
      expect(enforce.isArrayOf(enforce.isNumber()).test([1, '2', 3])).toBe(
        false,
      );
      expect(enforce.isArrayOf(enforce.isString()).test([])).toBe(true); // Empty array passes
    });

    it('Should validate optional fields', () => {
      expect(enforce.optional(enforce.isString()).test(undefined)).toBe(true);
      expect(enforce.optional(enforce.isString()).test(null)).toBe(true);
      expect(enforce.optional(enforce.isString()).test('hello')).toBe(true);
      expect(enforce.optional(enforce.isString()).test(123)).toBe(false);
    });
  });

  describe('Compound rules', () => {
    it('Should validate anyOf', () => {
      expect(
        enforce.anyOf(enforce.isString(), enforce.isNumber()).test('hello'),
      ).toBe(true);
      expect(
        enforce.anyOf(enforce.isString(), enforce.isNumber()).test(123),
      ).toBe(true);
      expect(
        enforce.anyOf(enforce.isString(), enforce.isNumber()).test(true),
      ).toBe(false);
    });

    it('Should validate allOf', () => {
      expect(
        enforce
          .allOf(enforce.isString(), enforce.isString().longerThan(3))
          .test('hello'),
      ).toBe(true);
      expect(
        enforce
          .allOf(enforce.isString(), enforce.isString().longerThan(10))
          .test('hello'),
      ).toBe(false);
    });

    it('Should validate oneOf', () => {
      expect(
        enforce.oneOf(enforce.isString(), enforce.isNumber()).test(123),
      ).toBe(true);
      // If value matches multiple rules, oneOf should fail
      // This depends on implementation - checking if string is considered numeric
    });

    it('Should validate noneOf', () => {
      expect(enforce.noneOf(enforce.isString()).test(123)).toBe(true);
      expect(enforce.noneOf(enforce.isString()).test('hello')).toBe(false);
    });
  });

  describe('Custom rules', () => {
    beforeEach(() => {
      enforce.extend({
        isEven: (value: number) => value % 2 === 0,
        isOdd: (value: number) => value % 2 !== 0,
        isPositiveNumber: (value: number) =>
          typeof value === 'number' && value > 0,
      });
    });

    it('Should work with custom rules', () => {
      expect(enforce.isEven().test(2)).toBe(true);
      expect(enforce.isEven().test(3)).toBe(false);
      expect(enforce.isOdd().test(3)).toBe(true);
      expect(enforce.isOdd().test(2)).toBe(false);
    });

    it('Should chain custom rules with built-in rules', () => {
      expect(enforce.isNumber().isPositiveNumber().test(5)).toBe(true);
      expect(enforce.isNumber().isPositiveNumber().test(-5)).toBe(false);
      expect(enforce.isNumber().isPositiveNumber().isEven().test(4)).toBe(true);
      expect(enforce.isNumber().isPositiveNumber().isEven().test(3)).toBe(
        false,
      );
    });

    it('Should work with custom rules returning objects', () => {
      enforce.extend({
        isPalindrome: (value: string) => ({
          pass: value === value.split('').reverse().join(''),
          message: 'Value must be a palindrome',
        }),
      });

      expect(enforce.isPalindrome().test('racecar')).toBe(true);
      expect(enforce.isPalindrome().test('hello')).toBe(false);
    });
  });

  describe('Complex validation scenarios', () => {
    it('Should handle nested schema validation', () => {
      expect(
        enforce
          .shape({
            user: enforce.shape({
              name: enforce.isString(),
              email: enforce.isString().matches(/@/),
            }),
          })
          .test({
            user: {
              name: 'John',
              email: 'john@example.com',
            },
          }),
      ).toBe(true);

      expect(
        enforce
          .shape({
            user: enforce.shape({
              name: enforce.isString(),
              email: enforce.isString().matches(/@/),
            }),
          })
          .test({
            user: {
              name: 'John',
              email: 'invalid-email',
            },
          }),
      ).toBe(false);
    });

    it('Should handle array of objects', () => {
      expect(
        enforce
          .isArrayOf(
            enforce.shape({
              id: enforce.isNumber(),
              name: enforce.isString(),
            }),
          )
          .test([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ]),
      ).toBe(true);

      expect(
        enforce
          .isArrayOf(
            enforce.shape({
              id: enforce.isNumber(),
              name: enforce.isString(),
            }),
          )
          .test([
            { id: 1, name: 'Alice' },
            { id: '2', name: 'Bob' }, // Invalid: id should be number
          ]),
      ).toBe(false);
    });

    it('Should handle complex compound validations', () => {
      expect(
        enforce
          .anyOf(
            enforce.allOf(enforce.isString(), enforce.isString().longerThan(5)),
            enforce.allOf(
              enforce.isNumber(),
              enforce.isNumber().greaterThan(100),
            ),
          )
          .test('hello world'),
      ).toBe(true);

      expect(
        enforce
          .anyOf(
            enforce.allOf(enforce.isString(), enforce.isString().longerThan(5)),
            enforce.allOf(
              enforce.isNumber(),
              enforce.isNumber().greaterThan(100),
            ),
          )
          .test(150),
      ).toBe(true);

      expect(
        enforce
          .anyOf(
            enforce.allOf(enforce.isString(), enforce.isString().longerThan(5)),
            enforce.allOf(
              enforce.isNumber(),
              enforce.isNumber().greaterThan(100),
            ),
          )
          .test('hi'),
      ).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('Should handle empty rule chain', () => {
      // Just creating a rule without any validations might still need to work
      expect(enforce.isString().test('test')).toBe(true);
    });

    it('Should handle falsy values correctly', () => {
      expect(enforce.equals(0).test(0)).toBe(true);
      expect(enforce.equals(false).test(false)).toBe(true);
      expect(enforce.equals('').test('')).toBe(true);
    });

    it('Should handle special values', () => {
      expect(enforce.isNaN().test(NaN)).toBe(true);
      expect(enforce.isNotNaN().test(123)).toBe(true);
    });
  });

  describe('Performance and reusability', () => {
    it('Should allow reusing validation rules', () => {
      const emailValidator = enforce.isString().matches(/@/).longerThan(5);

      expect(emailValidator.test('user@example.com')).toBe(true);
      expect(emailValidator.test('user@ex.co')).toBe(true);
      expect(emailValidator.test('short')).toBe(false);
    });

    it('Should work with stored validators', () => {
      const validators = {
        positiveNumber: enforce.isNumber().greaterThan(0),
        shortString: enforce.isString().shorterThan(10),
        validUser: enforce.shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      };

      expect(validators.positiveNumber.test(5)).toBe(true);
      expect(validators.shortString.test('hello')).toBe(true);
      expect(validators.validUser.test({ name: 'John', age: 30 })).toBe(true);
    });
  });

  describe('Comparison with .run()', () => {
    it('Should be equivalent to checking .run().pass', () => {
      const value = 'test';
      const rule = enforce.isString().longerThan(3);

      expect(rule.test(value)).toBe(rule.run(value).pass);
    });

    it('Should not provide error messages like .run()', () => {
      const result = enforce.isNumber().test('not a number');

      // test() returns just boolean, no message
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });
});
