import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('Lazy API - Integration Tests', () => {
  describe('.run() method', () => {
    it('returns detailed result with pass and type', () => {
      const passResult = enforce.isNumber().run(5);
      expect(passResult).toEqual({ pass: true, type: 5 });

      const failResult = enforce.isNumber().run('not a number');
      expect(failResult).toEqual({ pass: false, type: 'not a number' });
    });

    it('includes message on failure when available', () => {
      const result = enforce.isNumber().message('Must be a number').run('text');
      expect(result).toMatchObject({
        pass: false,
        type: 'text',
        message: 'Must be a number',
      });
    });

    it('chains multiple rules', () => {
      const result = enforce.isNumber().greaterThan(0).lessThan(10).run(5);
      expect(result).toEqual({ pass: true, type: 5 });

      const failResult = enforce.isNumber().greaterThan(10).lessThan(20).run(5);
      expect(failResult.pass).toBe(false);
    });

    it('works with all value types', () => {
      // String
      expect(enforce.isString().run('hello')).toEqual({
        pass: true,
        type: 'hello',
      });

      // Number
      expect(enforce.isNumber().run(42)).toEqual({
        pass: true,
        type: 42,
      });

      // Boolean
      expect(enforce.isBoolean().run(true)).toEqual({
        pass: true,
        type: true,
      });

      // Array
      const arr = [1, 2, 3];
      expect(enforce.isArray().run(arr)).toEqual({
        pass: true,
        type: arr,
      });

      // Object
      const obj = { key: 'value' };
      expect(enforce.isKeyOf(obj).run('key')).toEqual({
        pass: true,
        type: 'key',
      });

      // Null
      expect(enforce.isNull().run(null)).toEqual({
        pass: true,
        type: null,
      });

      // Undefined
      expect(enforce.isUndefined().run(undefined)).toEqual({
        pass: true,
        type: undefined,
      });
    });
  });

  describe('.test() method', () => {
    it('returns boolean (true/false)', () => {
      expect(enforce.isNumber().test(5)).toBe(true);
      expect(enforce.isNumber().test('not a number')).toBe(false);
    });

    it('is equivalent to .run().pass', () => {
      const value = 'test';
      const rule = enforce.isString().longerThan(3);

      expect(rule.test(value)).toBe(rule.run(value).pass);
    });

    it('works with chained rules', () => {
      expect(enforce.isNumber().greaterThan(0).lessThan(10).test(5)).toBe(true);
      expect(enforce.isNumber().greaterThan(10).lessThan(20).test(5)).toBe(
        false,
      );

      expect(
        enforce.isString().longerThan(2).shorterThan(10).test('hello'),
      ).toBe(true);
      expect(enforce.isString().longerThan(10).test('short')).toBe(false);
    });

    it('short-circuits on first failure', () => {
      // Even if later rules would also fail, returns false on first failure
      expect(
        enforce.isNumber().greaterThan(100).lessThan(50).test('not a number'),
      ).toBe(false);
    });
  });

  describe('Schema rules with lazy API', () => {
    it('validates shape with .run()', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      expect(schema.run({ name: 'John', age: 30 })).toEqual({
        pass: true,
        type: { name: 'John', age: 30 },
      });

      const failResult = schema.run({ name: 'John', age: '30' });
      expect(failResult.pass).toBe(false);
    });

    it('validates shape with .test()', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      expect(schema.test({ name: 'John', age: 30 })).toBe(true);
      expect(schema.test({ name: 'John', age: '30' })).toBe(false);
    });

    it('validates loose shape', () => {
      const schema = enforce.loose({
        name: enforce.isString(),
      });

      expect(schema.test({ name: 'John', extra: 'field' })).toBe(true);
      expect(schema.test({ name: 123 })).toBe(false);
    });

    it('validates isArrayOf', () => {
      const rule = enforce.isArrayOf(enforce.isNumber());

      expect(rule.test([1, 2, 3])).toBe(true);
      expect(rule.test([1, '2', 3])).toBe(false);
      expect(rule.test([])).toBe(true); // Empty array passes
    });

    it('validates optional fields', () => {
      const rule = enforce.optional(enforce.isString());

      expect(rule.test(undefined)).toBe(true);
      expect(rule.test(null)).toBe(true);
      expect(rule.test('hello')).toBe(true);
      expect(rule.test(123)).toBe(false);
    });
  });

  describe('Compound rules with lazy API', () => {
    it('validates anyOf', () => {
      const rule = enforce.anyOf(enforce.isString(), enforce.isNumber());

      expect(rule.test('hello')).toBe(true);
      expect(rule.test(123)).toBe(true);
      expect(rule.test(true)).toBe(false);
    });

    it('validates allOf', () => {
      const rule = enforce.allOf(
        enforce.isString(),
        enforce.isString().longerThan(3),
      );

      expect(rule.test('hello')).toBe(true);
      expect(rule.test('hi')).toBe(false);
    });

    it('validates noneOf', () => {
      const rule = enforce.noneOf(enforce.isString());

      expect(rule.test(123)).toBe(true);
      expect(rule.test('hello')).toBe(false);
    });

    it('validates oneOf', () => {
      const rule = enforce.oneOf(enforce.isString(), enforce.isNumber());

      expect(rule.test(123)).toBe(true);
      expect(rule.test('hello')).toBe(true);
    });
  });

  describe('Complex nested validation', () => {
    it('validates nested objects', () => {
      const schema = enforce.shape({
        user: enforce.shape({
          name: enforce.isString(),
          email: enforce.isString().matches(/@/),
        }),
      });

      expect(
        schema.test({
          user: {
            name: 'John',
            email: 'john@example.com',
          },
        }),
      ).toBe(true);

      expect(
        schema.test({
          user: {
            name: 'John',
            email: 'invalid-email',
          },
        }),
      ).toBe(false);
    });

    it('validates array of objects', () => {
      const rule = enforce.isArrayOf(
        enforce.shape({
          id: enforce.isNumber(),
          name: enforce.isString(),
        }),
      );

      expect(
        rule.test([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ]),
      ).toBe(true);

      expect(
        rule.test([
          { id: 1, name: 'Alice' },
          { id: '2', name: 'Bob' }, // Invalid: id should be number
        ]),
      ).toBe(false);
    });

    it('validates complex compound validations', () => {
      const rule = enforce.anyOf(
        enforce.allOf(enforce.isString(), enforce.isString().longerThan(5)),
        enforce.allOf(enforce.isNumber(), enforce.isNumber().greaterThan(100)),
      );

      expect(rule.test('hello world')).toBe(true);
      expect(rule.test(150)).toBe(true);
      expect(rule.test('hi')).toBe(false);
      expect(rule.test(50)).toBe(false);
    });
  });

  describe('Reusability', () => {
    it('allows reusing validation rules', () => {
      const emailValidator = enforce.isString().matches(/@/).longerThan(5);

      expect(emailValidator.test('user@example.com')).toBe(true);
      expect(emailValidator.test('user@ex.co')).toBe(true);
      expect(emailValidator.test('short')).toBe(false);

      // Can reuse multiple times
      expect(emailValidator.test('another@example.com')).toBe(true);
    });

    it('works with stored validators', () => {
      const validators = {
        positiveNumber: enforce.isNumber().greaterThan(0),
        shortString: enforce.isString().shorterThan(10),
        validUser: enforce.shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      };

      expect(validators.positiveNumber.test(5)).toBe(true);
      expect(validators.positiveNumber.test(-5)).toBe(false);

      expect(validators.shortString.test('hello')).toBe(true);
      expect(validators.shortString.test('very long string')).toBe(false);

      expect(validators.validUser.test({ name: 'John', age: 30 })).toBe(true);
      expect(validators.validUser.test({ name: 'John', age: '30' })).toBe(
        false,
      );
    });

    it('builds reusable validation libraries', () => {
      const validators = {
        email: enforce.isString().matches(/@/).longerThan(5),
        phone: enforce.isString().matches(/^\+?[\d\s-()]+$/),
        url: enforce.isString().matches(/^https?:\/\//),
        positiveInteger: enforce.isNumber().greaterThan(0),
      };

      expect(validators.email.test('user@example.com')).toBe(true);
      expect(validators.phone.test('+1-234-567-8900')).toBe(true);
      expect(validators.url.test('https://example.com')).toBe(true);
      expect(validators.positiveInteger.test(5)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles falsy values correctly', () => {
      expect(enforce.equals(0).test(0)).toBe(true);
      expect(enforce.equals(false).test(false)).toBe(true);
      expect(enforce.equals('').test('')).toBe(true);
      expect(enforce.equals(null).test(null)).toBe(true);
      expect(enforce.equals(undefined).test(undefined)).toBe(true);
    });

    it('handles special values', () => {
      expect(enforce.isNaN().test(NaN)).toBe(true);
      expect(enforce.isNotNaN().test(123)).toBe(true);
      expect(enforce.isNull().test(null)).toBe(true);
      expect(enforce.isUndefined().test(undefined)).toBe(true);
    });

    it('works with empty arrays and objects', () => {
      expect(enforce.isArray().test([])).toBe(true);
      expect(enforce.isEmpty().test([])).toBe(true);
      expect(enforce.isEmpty().test('')).toBe(true);
    });
  });

  describe('Real-world validation scenarios', () => {
    it('validates user registration data', () => {
      const Username = enforce
        .isString()
        .longerThan(3)
        .shorterThan(20)
        .matches(/^[a-zA-Z0-9_]+$/);

      const Email = enforce.isString().matches(/@/).matches(/\./);

      const Password = enforce
        .isString()
        .longerThan(7)
        .matches(/[A-Z]/)
        .matches(/[a-z]/)
        .matches(/[0-9]/);

      const UserRegistration = enforce.shape({
        username: Username,
        email: Email,
        password: Password,
      });

      expect(
        UserRegistration.test({
          username: 'john_doe',
          email: 'john@example.com',
          password: 'SecurePass123',
        }),
      ).toBe(true);

      expect(
        UserRegistration.test({
          username: 'ab', // Too short
          email: 'john@example.com',
          password: 'SecurePass123',
        }),
      ).toBe(false);
    });

    it('validates API response structure', () => {
      const User = enforce.shape({
        id: enforce.isNumber(),
        name: enforce.isString(),
        email: enforce.isString().matches(/@/),
      });

      const ApiResponse = enforce.shape({
        data: User,
        status: enforce.equals(200),
        timestamp: enforce.isNumber(),
      });

      expect(
        ApiResponse.test({
          data: {
            id: 1,
            name: 'John',
            email: 'john@example.com',
          },
          status: 200,
          timestamp: Date.now(),
        }),
      ).toBe(true);

      expect(
        ApiResponse.test({
          data: {
            id: 1,
            name: 'John',
            email: 'john@example.com',
          },
          status: 404, // Wrong status
          timestamp: Date.now(),
        }),
      ).toBe(false);
    });

    it('validates domain-specific data', () => {
      const Money = enforce.isNumber().greaterThanOrEquals(0);

      const Product = enforce.shape({
        id: enforce.isNumber(),
        name: enforce.isString().longerThan(0),
        price: Money,
        quantity: enforce.isNumber().greaterThanOrEquals(0),
      });

      expect(
        Product.test({
          id: 1,
          name: 'Widget',
          price: 19.99,
          quantity: 100,
        }),
      ).toBe(true);

      expect(
        Product.test({
          id: 1,
          name: 'Widget',
          price: -5, // Invalid: negative price
          quantity: 100,
        }),
      ).toBe(false);
    });
  });
});
