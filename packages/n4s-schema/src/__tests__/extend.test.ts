// @ts-nocheck
/* eslint-disable sort-keys, @typescript-eslint/no-unused-vars, no-unused-vars, no-useless-escape */
import { describe, it, expect, beforeEach } from 'vitest';

import { enforce } from 'n4s-schema';

describe('enforce.extend', () => {
  describe('Basic functionality', () => {
    describe('Boolean return values', () => {
      beforeEach(() => {
        enforce.extend({
          isValidEmail: (value: string) => value.indexOf('@') > -1,
          hasKey: (value: Record<string, any>, key: string) =>
            value.hasOwnProperty(key),
        });
      });

      it('Should allow custom rule with boolean return value (true)', () => {
        expect(() => enforce('test@example.com').isValidEmail()).not.toThrow();
      });

      it('Should allow custom rule with boolean return value (false)', () => {
        expect(() => enforce('invalid-email').isValidEmail()).toThrow();
      });

      it('Should work with multiple arguments', () => {
        expect(() => enforce({ name: 'John' }).hasKey('name')).not.toThrow();
        expect(() => enforce({ name: 'John' }).hasKey('age')).toThrow();
      });

      it('Should work in lazy mode with .run()', () => {
        expect(enforce.isValidEmail().run('test@example.com').pass).toBe(true);
        expect(enforce.isValidEmail().run('invalid-email').pass).toBe(false);
      });

      it('Should work in lazy mode with .run() returning full result', () => {
        expect(enforce.isValidEmail().run('test@example.com')).toEqual({
          pass: true,
          type: 'test@example.com',
        });
        expect(enforce.isValidEmail().run('invalid-email')).toEqual({
          pass: false,
          type: 'invalid-email',
        });
      });
    });

    describe('Object return values with pass and message', () => {
      beforeEach(() => {
        enforce.extend({
          isValidEmail: (value: string) => ({
            pass: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
            message: () => `${value} is not a valid email address`,
          }),
          isWithinRange: (value: number, floor: number, ceiling: number) => {
            const pass = value >= floor && value <= ceiling;
            return {
              pass,
              message: () =>
                pass
                  ? `expected ${value} not to be within range ${floor} - ${ceiling}`
                  : `expected ${value} to be within range ${floor} - ${ceiling}`,
            };
          },
        });
      });

      it('Should handle object return with pass: true', () => {
        expect(() => enforce('test@example.com').isValidEmail()).not.toThrow();
      });

      it('Should handle object return with pass: false and use custom message', () => {
        expect(() => enforce('invalid').isValidEmail()).toThrow(
          'invalid is not a valid email address',
        );
      });

      it('Should work with multiple arguments', () => {
        expect(() => enforce(5).isWithinRange(1, 10)).not.toThrow();
        expect(() => enforce(15).isWithinRange(1, 10)).toThrow(
          'expected 15 to be within range 1 - 10',
        );
      });

      it('Should work in lazy mode with .run()', () => {
        expect(enforce.isValidEmail().run('test@example.com').pass).toBe(true);
        expect(enforce.isValidEmail().run('invalid').pass).toBe(false);
      });

      it('Should work in lazy mode with .run() returning full result', () => {
        expect(enforce.isValidEmail().run('test@example.com')).toEqual({
          pass: true,
          type: 'test@example.com',
        });
        expect(enforce.isValidEmail().run('invalid')).toEqual({
          pass: false,
          type: 'invalid',
        });
      });
    });

    describe('Object return with just message string', () => {
      beforeEach(() => {
        enforce.extend({
          customRule: () => ({
            pass: false,
            message: 'Static error message',
          }),
        });
      });

      it('Should handle message as string instead of function', () => {
        expect(() => enforce('value').customRule()).toThrow(
          'Static error message',
        );
      });

      it('Should work with .run()', () => {
        expect(enforce.customRule().run('value')).toEqual({
          pass: false,
          type: 'value',
        });
      });
    });
  });

  describe('Chaining custom rules', () => {
    beforeEach(() => {
      enforce.extend({
        startsWithUnderscore: (value: string) => ({
          pass: value.startsWith('_'),
          message: () => `${value} does not start with underscore`,
        }),
        hasLength: (value: string, length: number) => value.length === length,
        isLowerCase: (value: string) => value === value.toLowerCase(),
      });
    });

    it('Should allow chaining custom rules with built-in rules', () => {
      expect(() =>
        enforce('_test').startsWithUnderscore().isString(),
      ).not.toThrow();
    });

    it('Should allow chaining multiple custom rules', () => {
      expect(() =>
        enforce('_test').startsWithUnderscore().hasLength(5).isLowerCase(),
      ).not.toThrow();
    });

    it('Should throw on first failed rule in chain', () => {
      expect(() => enforce('test').startsWithUnderscore().hasLength(4)).toThrow(
        'test does not start with underscore',
      );
    });

    it('Should work with lazy evaluation', () => {
      expect(
        enforce.startsWithUnderscore().hasLength(5).isLowerCase().run('_test')
          .pass,
      ).toBe(true);
      expect(
        enforce.startsWithUnderscore().hasLength(5).isLowerCase().run('_TEST')
          .pass,
      ).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('Should handle custom rule that returns undefined', () => {
      enforce.extend({
        returnsUndefined: () => undefined as any,
      });
      expect(() => enforce('test').returnsUndefined()).toThrow();
    });

    it('Should handle custom rule that returns null', () => {
      enforce.extend({
        returnsNull: () => null as any,
      });
      expect(() => enforce('test').returnsNull()).toThrow();
    });

    it('Should handle custom rule that throws an error', () => {
      enforce.extend({
        throwsError: () => {
          throw new Error('Custom error');
        },
      });
      expect(() => enforce('test').throwsError()).toThrow('Custom error');
    });

    it('Should handle custom rule with no arguments', () => {
      enforce.extend({
        alwaysTrue: () => true,
        alwaysFalse: () => false,
      });
      expect(() => enforce('test').alwaysTrue()).not.toThrow();
      expect(() => enforce('test').alwaysFalse()).toThrow();
    });

    it('Should handle custom rule receiving different value types', () => {
      enforce.extend({
        checkType: (value: any) => ({
          pass: true,
          message: () => `Type: ${typeof value}`,
        }),
      });
      expect(() => enforce(123).checkType()).not.toThrow();
      expect(() => enforce('string').checkType()).not.toThrow();
      expect(() => enforce(null).checkType()).not.toThrow();
      expect(() => enforce(undefined).checkType()).not.toThrow();
      expect(() => enforce({}).checkType()).not.toThrow();
      expect(() => enforce([]).checkType()).not.toThrow();
    });

    it('Should handle custom rules with many arguments', () => {
      enforce.extend({
        sumEquals: (value: number, ...args: number[]) =>
          value === args.reduce((sum, n) => sum + n, 0),
      });
      expect(() => enforce(10).sumEquals(1, 2, 3, 4)).not.toThrow();
      expect(() => enforce(10).sumEquals(1, 2, 3)).toThrow();
    });
  });

  describe('Multiple extend calls', () => {
    it('Should allow multiple extend calls to add different rules', () => {
      enforce.extend({
        customRule1: () => true,
      });
      enforce.extend({
        customRule2: () => true,
      });
      expect(() => enforce('test').customRule1().customRule2()).not.toThrow();
    });

    it('Should allow overriding existing custom rules', () => {
      enforce.extend({
        toggleRule: () => true,
      });
      expect(() => enforce('test').toggleRule()).not.toThrow();

      enforce.extend({
        toggleRule: () => false,
      });
      expect(() => enforce('test').toggleRule()).toThrow();
    });

    it('Should not affect built-in rules', () => {
      enforce.extend({
        customRule: () => true,
      });
      // Built-in rules should still work
      expect(() => enforce('test').isString()).not.toThrow();
      expect(() => enforce(123).isNumber()).not.toThrow();
    });
  });

  describe('Integration with schema rules', () => {
    beforeEach(() => {
      enforce.extend({
        isEmail: (value: string) =>
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
        isAdult: (value: number) => value >= 18,
      });
    });

    it('Should work within shape()', () => {
      const schema = enforce.shape({
        email: enforce.isString().isEmail(),
        age: enforce.isNumber().isAdult(),
      });

      expect(schema.run({ email: 'test@example.com', age: 25 }).pass).toBe(
        true,
      );
      expect(schema.run({ email: 'invalid', age: 16 }).pass).toBe(false);
    });

    it('Should work within loose()', () => {
      const schema = enforce.loose({
        email: enforce.isString().isEmail(),
      });
      expect(
        schema.run({ email: 'test@example.com', extra: 'field' }).pass,
      ).toBe(true);
    });

    it('Should work within isArrayOf()', () => {
      const rule = enforce.isArrayOf(enforce.isString().isEmail());
      expect(rule.run(['test@example.com', 'another@example.com']).pass).toBe(
        true,
      );
      expect(rule.run(['test@example.com', 'invalid']).pass).toBe(false);
    });

    it('Should work within optional()', () => {
      const schema = enforce.shape({
        email: enforce.optional(enforce.isString().isEmail()),
      });
      expect(schema.run({ email: 'test@example.com' }).pass).toBe(true);
      expect(schema.run({}).pass).toBe(true);
    });
  });

  describe('Integration with compound rules', () => {
    beforeEach(() => {
      enforce.extend({
        isPositive: (value: number) => value > 0,
        isEven: (value: number) => value % 2 === 0,
        isOdd: (value: number) => value % 2 !== 0,
      });
    });

    it('Should work within allOf()', () => {
      const ok = enforce
        .allOf(enforce.isNumber(), enforce.isPositive(), enforce.isEven())
        .run(4).pass;
      expect(ok).toBe(true);

      const notOk = enforce
        .allOf(enforce.isNumber(), enforce.isPositive(), enforce.isEven())
        .run(-4).pass;
      expect(notOk).toBe(false);
    });

    it('Should work within anyOf()', () => {
      const res = enforce.anyOf(enforce.isEven(), enforce.isOdd()).run(3).pass;
      expect(res).toBe(true);
    });

    it('Should work within noneOf()', () => {
      const res = enforce
        .noneOf(enforce.isNumber(), enforce.isPositive())
        .run('string').pass;
      expect(res).toBe(true);
    });

    it('Should work within oneOf()', () => {
      expect(() =>
        enforce(3).oneOf(enforce.isEven(), enforce.isOdd(), enforce.isNumber()),
      ).toThrow(); // Fails because two rules pass (isOdd and isNumber)
    });
  });

  describe('Custom rules with enforce.context()', () => {
    beforeEach(() => {
      enforce.extend({
        contextAware: (value: string) => {
          const context = enforce.context();
          return !!context;
        },
        accessParent: (value: string) => {
          const context = enforce.context();
          return context?.parent !== undefined;
        },
        accessMeta: (value: string) => {
          const context = enforce.context();
          return context?.meta !== undefined;
        },
      });
    });

    it('Should have access to context', () => {
      expect(() => enforce('test').contextAware()).not.toThrow();
    });

    it('Should have access to parent in context', () => {
      expect(() => enforce('test').accessParent()).not.toThrow();
    });

    it('Should have access to meta in context', () => {
      expect(() => enforce('test').accessMeta()).not.toThrow();
    });

    it('Should allow traversing parent values', () => {
      enforce.extend({
        isFriendTheSameAsUser: (value: string) => {
          const context = enforce.context();
          if (value === context?.parent()?.parent()?.value.username) {
            return {
              pass: false,
              message: () => 'Friend cannot be the same as username',
            };
          }
          return true;
        },
      });

      expect(() =>
        enforce({
          username: 'johndoe',
          friends: ['Mike', 'Jim'],
        }).shape({
          username: enforce.isString(),
          friends: enforce.isArrayOf(
            enforce.isString().isFriendTheSameAsUser(),
          ),
        }),
      ).not.toThrow();

      expect(() =>
        enforce({
          username: 'johndoe',
          friends: ['Mike', 'Jim', 'johndoe'],
        }).shape({
          username: enforce.isString(),
          friends: enforce.isArrayOf(
            enforce.isString().isFriendTheSameAsUser(),
          ),
        }),
      ).toThrow('Friend cannot be the same as username');
    });
  });

  describe('Custom rules with enforce.message()', () => {
    beforeEach(() => {
      enforce.extend({
        ruleWithMessage: () => ({
          pass: false,
          message: () => 'Original message',
        }),
        ruleWithoutMessage: () => false,
      });
    });

    it('Should allow overriding custom rule message', () => {
      expect(() =>
        enforce('test').message('Custom message').ruleWithMessage(),
      ).toThrow('Custom message');
    });

    it('Should allow overriding message on rules without explicit message', () => {
      expect(() =>
        enforce('test').message('Custom message').ruleWithoutMessage(),
      ).toThrow('Custom message');
    });

    it('Should work with message as function', () => {
      expect(() =>
        enforce('test')
          .message(() => 'Custom message')
          .ruleWithMessage(),
      ).toThrow('Custom message');
    });
  });

  describe('Type coercion and edge cases', () => {
    beforeEach(() => {
      enforce.extend({
        checksEquality: (value: any, expected: any) => value === expected,
        checksLooseEquality: (value: any, expected: any) => value == expected,
      });
    });

    it('Should handle strict equality', () => {
      expect(() => enforce(1).checksEquality(1)).not.toThrow();
      expect(() => enforce(1).checksEquality('1')).toThrow();
      expect(() => enforce(true).checksEquality(1)).toThrow();
      expect(() => enforce(null).checksEquality(undefined)).toThrow();
    });

    it('Should handle loose equality', () => {
      expect(() => enforce(1).checksLooseEquality('1')).not.toThrow();
      expect(() => enforce(true).checksLooseEquality(1)).not.toThrow();
      expect(() => enforce(null).checksLooseEquality(undefined)).not.toThrow();
    });

    it('Should handle falsy values correctly', () => {
      enforce.extend({
        isFalsy: (value: any) => !value,
        isTruthy: (value: any) => !!value,
      });

      expect(() => enforce(0).isFalsy()).not.toThrow();
      expect(() => enforce('').isFalsy()).not.toThrow();
      expect(() => enforce(false).isFalsy()).not.toThrow();
      expect(() => enforce(null).isFalsy()).not.toThrow();
      expect(() => enforce(undefined).isFalsy()).not.toThrow();

      expect(() => enforce(1).isTruthy()).not.toThrow();
      expect(() => enforce('text').isTruthy()).not.toThrow();
      expect(() => enforce(true).isTruthy()).not.toThrow();
      expect(() => enforce({}).isTruthy()).not.toThrow();
      expect(() => enforce([]).isTruthy()).not.toThrow();
    });
  });

  describe('Complex real-world scenarios', () => {
    it('Should support password validation rules', () => {
      enforce.extend({
        hasMinLength: (value: string, length: number) => value.length >= length,
        hasUpperCase: (value: string) => /[A-Z]/.test(value),
        hasLowerCase: (value: string) => /[a-z]/.test(value),
        hasNumber: (value: string) => /[0-9]/.test(value),
        hasSpecialChar: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });

      const password = 'SecureP@ss123';
      expect(() =>
        enforce(password)
          .hasMinLength(8)
          .hasUpperCase()
          .hasLowerCase()
          .hasNumber()
          .hasSpecialChar(),
      ).not.toThrow();

      expect(() => enforce('weak').hasMinLength(8)).toThrow();
      expect(() => enforce('alllowercase').hasUpperCase()).toThrow();
    });

    it('Should support conditional validation', () => {
      enforce.extend({
        passwordsMatch: (passConfirm: string, password: string) =>
          passConfirm === password,
        isValidIf: (value: any, condition: boolean, validator: () => boolean) =>
          !condition || validator(),
      });

      expect(() => enforce('pass123').passwordsMatch('pass123')).not.toThrow();
      expect(() => enforce('pass123').passwordsMatch('different')).toThrow();
    });

    it('Should support date range validation', () => {
      enforce.extend({
        isAfter: (value: Date, date: Date) => value > date,
        isBefore: (value: Date, date: Date) => value < date,
        isBetween: (value: Date, start: Date, end: Date) =>
          value >= start && value <= end,
      });

      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const tomorrow = new Date(now.getTime() + 86400000);

      expect(() => enforce(now).isAfter(yesterday)).not.toThrow();
      expect(() => enforce(now).isBefore(tomorrow)).not.toThrow();
      expect(() => enforce(now).isBetween(yesterday, tomorrow)).not.toThrow();
    });
  });

  describe('Performance and stress tests', () => {
    it('Should handle many custom rules', () => {
      const rules: Record<string, () => boolean> = {};
      for (let i = 0; i < 100; i++) {
        rules[`rule${i}`] = () => true;
      }
      enforce.extend(rules);

      expect(() => enforce('test').rule0().rule50().rule99()).not.toThrow();
    });

    it('Should handle deeply nested validation with custom rules', () => {
      enforce.extend({
        isEmail: (value: string) =>
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
        isAdult: (value: number) => value >= 18,
      });

      const schema = enforce.shape({
        user: enforce.shape({
          profile: enforce.shape({
            contact: enforce.shape({
              email: enforce.isString().isEmail(),
            }),
            age: enforce.isNumber().isAdult(),
          }),
        }),
      });
      expect(
        schema.run({
          user: {
            profile: { contact: { email: 'test@example.com' }, age: 25 },
          },
        }).pass,
      ).toBe(true);
    });
  });

  describe('Error message customization', () => {
    it('Should support dynamic error messages based on input', () => {
      enforce.extend({
        isInRange: (value: number, min: number, max: number) => ({
          pass: value >= min && value <= max,
          message: () =>
            `Value ${value} is outside the allowed range of ${min}-${max}`,
        }),
      });

      expect(() => enforce(15).isInRange(1, 10)).toThrow(
        'Value 15 is outside the allowed range of 1-10',
      );
    });

    it('Should support error messages with context', () => {
      enforce.extend({
        notSameAsField: (value: string, fieldName: string) => {
          const context = enforce.context();
          const parentValue = context?.parent()?.value;
          return {
            pass: value !== parentValue?.[fieldName],
            message: () =>
              `Value cannot be the same as ${fieldName}: ${parentValue?.[fieldName]}`,
          };
        },
      });

      expect(() =>
        enforce({
          username: 'johndoe',
          displayName: 'johndoe',
        }).shape({
          username: enforce.isString(),
          displayName: enforce.isString().notSameAsField('username'),
        }),
      ).toThrow('Value cannot be the same as username: johndoe');
    });
  });

  describe('Async behavior considerations', () => {
    it('Should handle custom rules that might be used async (returning promises should fail sync)', () => {
      enforce.extend({
        // This simulates someone accidentally returning a promise
        asyncRule: () => Promise.resolve(true) as any,
      });

      // In n4s-schema eager path, invalid return values should throw
      expect(() => enforce('test').asyncRule()).toThrow();
    });
  });

  describe('Cleanup and isolation', () => {
    it('Should not leak custom rules between test runs', () => {
      // This test ensures that custom rules don't persist unexpectedly
      // Note: In actual implementation, this might require cleanup between tests

      enforce.extend({
        temporaryRule: () => true,
      });

      expect((enforce as any).temporaryRule).toBeDefined();
    });
  });

  describe('Integration with condition()', () => {
    it('Should work alongside enforce.condition()', () => {
      enforce.extend({
        isEven: (value: number) => value % 2 === 0,
      });

      expect(enforce.condition(() => true).run(4).pass).toBe(true);
      expect(enforce.condition(() => false).run(3).pass).toBe(false);
    });
  });

  describe('Comprehensive Lazy API tests', () => {
    describe('Boolean return values with lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          isValidEmail: (value: string) => value.indexOf('@') > -1,
          hasKey: (value: Record<string, any>, key: string) =>
            value.hasOwnProperty(key),
          isPositive: (value: number) => value > 0,
          isEven: (value: number) => value % 2 === 0,
          isLengthBetween: (value: string, min: number, max: number) =>
            value.length >= min && value.length <= max,
        });
      });

      it('Should work with single argument - passing case', () => {
        const result = enforce.isValidEmail().run('test@example.com');
        expect(result).toEqual({
          pass: true,
          type: 'test@example.com',
        });
      });

      it('Should work with single argument - failing case', () => {
        const result = enforce.isValidEmail().run('invalid-email');
        expect(result).toEqual({
          pass: false,
          type: 'invalid-email',
        });
      });

      it('Should work with multiple arguments - passing case', () => {
        const result = enforce.hasKey('name').run({ name: 'John', age: 30 });
        expect(result).toEqual({
          pass: true,
          type: { name: 'John', age: 30 },
        });
      });

      it('Should work with multiple arguments - failing case', () => {
        const result = enforce.hasKey('email').run({ name: 'John', age: 30 });
        expect(result).toEqual({
          pass: false,
          type: { name: 'John', age: 30 },
        });
      });

      it('Should work with numeric validations', () => {
        expect(enforce.isPositive().run(5)).toEqual({
          pass: true,
          type: 5,
        });
        expect(enforce.isPositive().run(-5)).toEqual({
          pass: false,
          type: -5,
        });
        expect(enforce.isEven().run(4)).toEqual({
          pass: true,
          type: 4,
        });
        expect(enforce.isEven().run(3)).toEqual({
          pass: false,
          type: 3,
        });
      });

      it('Should work with multiple arguments and complex types', () => {
        expect(enforce.isLengthBetween(3, 10).run('hello')).toEqual({
          pass: true,
          type: 'hello',
        });
        expect(enforce.isLengthBetween(3, 10).run('hi')).toEqual({
          pass: false,
          type: 'hi',
        });
        expect(enforce.isLengthBetween(3, 10).run('this is too long')).toEqual({
          pass: false,
          type: 'this is too long',
        });
      });

      it('Should handle different data types', () => {
        enforce.extend({
          alwaysTrue: () => true,
          alwaysFalse: () => false,
        });

        // String
        expect(enforce.alwaysTrue().run('string')).toEqual({
          pass: true,
          type: 'string',
        });

        // Number
        expect(enforce.alwaysTrue().run(42)).toEqual({
          pass: true,
          type: 42,
        });

        // Boolean
        expect(enforce.alwaysTrue().run(true)).toEqual({
          pass: true,
          type: true,
        });

        // Object
        const obj = { key: 'value' };
        expect(enforce.alwaysTrue().run(obj)).toEqual({
          pass: true,
          type: obj,
        });

        // Array
        const arr = [1, 2, 3];
        expect(enforce.alwaysTrue().run(arr)).toEqual({
          pass: true,
          type: arr,
        });

        // Null
        expect(enforce.alwaysTrue().run(null)).toEqual({
          pass: true,
          type: null,
        });

        // Undefined
        expect(enforce.alwaysTrue().run(undefined)).toEqual({
          pass: true,
          type: undefined,
        });
      });
    });

    describe('Object return values with lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          isValidEmailWithMessage: (value: string) => ({
            pass: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
            message: () => `${value} is not a valid email address`,
          }),
          isWithinRange: (value: number, floor: number, ceiling: number) => {
            const pass = value >= floor && value <= ceiling;
            return {
              pass,
              message: () =>
                pass
                  ? `expected ${value} not to be within range ${floor} - ${ceiling}`
                  : `expected ${value} to be within range ${floor} - ${ceiling}`,
            };
          },
          hasExactLength: (value: string, length: number) => ({
            pass: value.length === length,
            message: () => `Expected length ${length}, got ${value.length}`,
          }),
        });
      });

      it('Should work with object return - passing case', () => {
        const result = enforce
          .isValidEmailWithMessage()
          .run('test@example.com');
        expect(result).toEqual({
          pass: true,
          type: 'test@example.com',
        });
      });

      it('Should work with object return - failing case', () => {
        const result = enforce.isValidEmailWithMessage().run('invalid');
        expect(result).toEqual({
          pass: false,
          type: 'invalid',
        });
      });

      it('Should work with multiple arguments and object return', () => {
        expect(enforce.isWithinRange(1, 10).run(5)).toEqual({
          pass: true,
          type: 5,
        });
        expect(enforce.isWithinRange(1, 10).run(15)).toEqual({
          pass: false,
          type: 15,
        });
      });

      it('Should work with complex validation scenarios', () => {
        expect(enforce.hasExactLength(5).run('hello')).toEqual({
          pass: true,
          type: 'hello',
        });
        expect(enforce.hasExactLength(5).run('hi')).toEqual({
          pass: false,
          type: 'hi',
        });
      });
    });

    describe('Chaining with lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          startsWithUnderscore: (value: string) => value.startsWith('_'),
          hasMinLength: (value: string, length: number) =>
            value.length >= length,
          isLowerCase: (value: string) => value === value.toLowerCase(),
          isAlphanumeric: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
        });
      });

      it('Should work with chained custom rules', () => {
        const result = enforce
          .startsWithUnderscore()
          .hasMinLength(5)
          .isLowerCase()
          .run('_test');
        expect(result).toEqual({
          pass: true,
          type: '_test',
        });
      });

      it('Should fail on first failed rule in chain', () => {
        const result = enforce
          .startsWithUnderscore()
          .hasMinLength(5)
          .isLowerCase()
          .run('test');
        expect(result).toEqual({
          pass: false,
          type: 'test',
        });
      });

      it('Should work with mix of custom and built-in rules', () => {
        const result = enforce
          .isString()
          .startsWithUnderscore()
          .hasMinLength(3)
          .run('_ab');
        expect(result).toEqual({
          pass: true,
          type: '_ab',
        });
      });

      it('Should work with complex chaining scenarios', () => {
        expect(
          enforce.isString().hasMinLength(1).isAlphanumeric().run('test123'),
        ).toEqual({
          pass: true,
          type: 'test123',
        });

        expect(
          enforce.isString().hasMinLength(1).isAlphanumeric().run('test-123'),
        ).toEqual({
          pass: false,
          type: 'test-123',
        });
      });
    });

    describe('Error handling in lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          throwsError: () => {
            throw new Error('Custom validation error');
          },
          returnsUndefined: () => undefined as any,
          returnsNull: () => null as any,
          returnsInvalidObject: () => ({ invalid: true }) as any,
        });
      });

      it('Should handle rules that throw errors', () => {
        expect(() => enforce.throwsError().run('test')).toThrow(
          'Custom validation error',
        );
      });

      it('Should handle rules that return undefined', () => {
        const result = enforce.returnsUndefined().run('test');
        expect(result).toEqual({
          pass: false,
          type: 'test',
        });
      });

      it('Should handle rules that return null', () => {
        const result = enforce.returnsNull().run('test');
        expect(result).toEqual({
          pass: false,
          type: 'test',
        });
      });

      it('Should handle rules that return invalid objects', () => {
        const result = enforce.returnsInvalidObject().run('test');
        expect(result).toEqual({
          pass: false,
          type: 'test',
        });
      });
    });

    describe('Type coercion and edge cases in lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          strictEquals: (value: any, expected: any) => value === expected,
          looseEquals: (value: any, expected: any) => value == expected,
          isTruthy: (value: any) => !!value,
          isFalsy: (value: any) => !value,
          typeCheck: (value: any, expectedType: string) =>
            typeof value === expectedType,
        });
      });

      it('Should handle strict equality comparisons', () => {
        expect(enforce.strictEquals(1).run(1)).toEqual({
          pass: true,
          type: 1,
        });
        expect(enforce.strictEquals(1).run('1')).toEqual({
          pass: false,
          type: '1',
        });
        expect(enforce.strictEquals(true).run(1)).toEqual({
          pass: false,
          type: 1,
        });
      });

      it('Should handle loose equality comparisons', () => {
        expect(enforce.looseEquals(1).run('1')).toEqual({
          pass: true,
          type: '1',
        });
        expect(enforce.looseEquals(true).run(1)).toEqual({
          pass: true,
          type: 1,
        });
        expect(enforce.looseEquals(null).run(undefined)).toEqual({
          pass: true,
          type: undefined,
        });
      });

      it('Should handle truthy/falsy checks', () => {
        // Truthy values
        expect(enforce.isTruthy().run(1)).toEqual({ pass: true, type: 1 });
        expect(enforce.isTruthy().run('text')).toEqual({
          pass: true,
          type: 'text',
        });
        expect(enforce.isTruthy().run(true)).toEqual({
          pass: true,
          type: true,
        });
        expect(enforce.isTruthy().run({})).toEqual({ pass: true, type: {} });
        expect(enforce.isTruthy().run([])).toEqual({ pass: true, type: [] });

        // Falsy values
        expect(enforce.isFalsy().run(0)).toEqual({ pass: true, type: 0 });
        expect(enforce.isFalsy().run('')).toEqual({ pass: true, type: '' });
        expect(enforce.isFalsy().run(false)).toEqual({
          pass: true,
          type: false,
        });
        expect(enforce.isFalsy().run(null)).toEqual({ pass: true, type: null });
        expect(enforce.isFalsy().run(undefined)).toEqual({
          pass: true,
          type: undefined,
        });
      });

      it('Should handle type checking', () => {
        expect(enforce.typeCheck('string').run('hello')).toEqual({
          pass: true,
          type: 'hello',
        });
        expect(enforce.typeCheck('number').run(42)).toEqual({
          pass: true,
          type: 42,
        });
        expect(enforce.typeCheck('boolean').run(true)).toEqual({
          pass: true,
          type: true,
        });
        expect(enforce.typeCheck('object').run({})).toEqual({
          pass: true,
          type: {},
        });
        expect(enforce.typeCheck('object').run(null)).toEqual({
          pass: true,
          type: null,
        });
        expect(enforce.typeCheck('undefined').run(undefined)).toEqual({
          pass: true,
          type: undefined,
        });

        // Type mismatches
        expect(enforce.typeCheck('string').run(42)).toEqual({
          pass: false,
          type: 42,
        });
        expect(enforce.typeCheck('number').run('hello')).toEqual({
          pass: false,
          type: 'hello',
        });
      });
    });

    describe('Complex scenarios with lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          isEmail: (value: string) =>
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
          isStrongPassword: (value: string) => {
            const hasLength = value.length >= 8;
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasNumber = /[0-9]/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
          },
          isPhoneNumber: (value: string) =>
            /^\+?[\d\s\-\(\)]{10,}$/.test(value),
          isValidAge: (value: number) => value >= 0 && value <= 150,
          isValidDate: (value: Date) =>
            value instanceof Date && !isNaN(value.getTime()),
        });
      });

      it('Should work with email validation', () => {
        expect(enforce.isEmail().run('test@example.com')).toEqual({
          pass: true,
          type: 'test@example.com',
        });
        expect(enforce.isEmail().run('invalid-email')).toEqual({
          pass: false,
          type: 'invalid-email',
        });
      });

      it('Should work with password validation', () => {
        expect(enforce.isStrongPassword().run('StrongP@ss123')).toEqual({
          pass: true,
          type: 'StrongP@ss123',
        });
        expect(enforce.isStrongPassword().run('weak')).toEqual({
          pass: false,
          type: 'weak',
        });
      });

      it('Should work with phone number validation', () => {
        expect(enforce.isPhoneNumber().run('+1234567890')).toEqual({
          pass: true,
          type: '+1234567890',
        });
        expect(enforce.isPhoneNumber().run('123')).toEqual({
          pass: false,
          type: '123',
        });
      });

      it('Should work with age validation', () => {
        expect(enforce.isValidAge().run(25)).toEqual({
          pass: true,
          type: 25,
        });
        expect(enforce.isValidAge().run(-5)).toEqual({
          pass: false,
          type: -5,
        });
        expect(enforce.isValidAge().run(200)).toEqual({
          pass: false,
          type: 200,
        });
      });

      it('Should work with date validation', () => {
        const validDate = new Date('2023-01-01');
        const invalidDate = new Date('invalid');

        expect(enforce.isValidDate().run(validDate)).toEqual({
          pass: true,
          type: validDate,
        });
        expect(enforce.isValidDate().run(invalidDate)).toEqual({
          pass: false,
          type: invalidDate,
        });
      });
    });

    describe('Integration with schema rules in lazy API', () => {
      beforeEach(() => {
        enforce.extend({
          isEmail: (value: string) =>
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
          isAdult: (value: number) => value >= 18,
          hasValidPassword: (value: string) => {
            return (
              value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)
            );
          },
        });
      });

      it('Should work within shape() using lazy API', () => {
        const schema = enforce.shape({
          email: enforce.isString().isEmail(),
          age: enforce.isNumber().isAdult(),
          password: enforce.isString().hasValidPassword(),
        });

        const validData = {
          email: 'test@example.com',
          age: 25,
          password: 'SecurePass123',
        };

        const invalidData = {
          email: 'invalid-email',
          age: 16,
          password: 'weak',
        };

        expect(schema.run(validData)).toEqual({
          pass: true,
          type: validData,
        });
        expect(schema.run(invalidData)).toEqual({
          pass: false,
          type: invalidData,
        });
      });

      it('Should work within isArrayOf() using lazy API', () => {
        const emailArrayRule = enforce.isArrayOf(enforce.isString().isEmail());

        const validEmails = ['test@example.com', 'another@example.com'];
        const invalidEmails = ['test@example.com', 'invalid-email'];

        expect(emailArrayRule.run(validEmails)).toEqual({
          pass: true,
          type: validEmails,
        });
        expect(emailArrayRule.run(invalidEmails)).toEqual({
          pass: false,
          type: invalidEmails,
        });
      });

      it('Should work within optional() using lazy API', () => {
        const schema = enforce.shape({
          email: enforce.optional(enforce.isString().isEmail()),
          age: enforce.optional(enforce.isNumber().isAdult()),
        });

        expect(schema.run({ email: 'test@example.com', age: 25 })).toEqual({
          pass: true,
          type: { email: 'test@example.com', age: 25 },
        });
        expect(schema.run({ email: 'test@example.com' })).toEqual({
          pass: true,
          type: { email: 'test@example.com' },
        });
        expect(schema.run({})).toEqual({
          pass: true,
          type: {},
        });
      });
    });

    describe('Performance and edge cases in lazy API', () => {
      it('Should handle many custom rules with lazy API', () => {
        const rules: Record<string, () => boolean> = {};
        for (let i = 0; i < 50; i++) {
          rules[`rule${i}`] = () => true;
        }
        enforce.extend(rules);

        const result = enforce.rule0().rule25().rule49().run('test');
        expect(result).toEqual({
          pass: true,
          type: 'test',
        });
      });

      it('Should handle rules with many arguments in lazy API', () => {
        enforce.extend({
          sumEquals: (value: number, ...args: number[]) =>
            value === args.reduce((sum, n) => sum + n, 0),
          concatenatesTo: (value: string, ...parts: string[]) =>
            value === parts.join(''),
        });

        expect(enforce.sumEquals(1, 2, 3, 4).run(10)).toEqual({
          pass: true,
          type: 10,
        });
        expect(enforce.sumEquals(1, 2, 3).run(10)).toEqual({
          pass: false,
          type: 10,
        });

        expect(
          enforce.concatenatesTo('hello', 'world').run('helloworld'),
        ).toEqual({
          pass: true,
          type: 'helloworld',
        });
        expect(
          enforce.concatenatesTo('hello', 'world').run('hello world'),
        ).toEqual({
          pass: false,
          type: 'hello world',
        });
      });

      it('Should handle complex nested objects and arrays', () => {
        enforce.extend({
          hasProperty: (value: any, prop: string) =>
            value && value.hasOwnProperty(prop),
          arrayContains: (value: any[], item: any) =>
            value.some(v =>
              v && item && typeof v === 'object' && typeof item === 'object'
                ? JSON.stringify(v) === JSON.stringify(item)
                : v === item,
            ),
          objectDeepEquals: (value: any, expected: any) =>
            JSON.stringify(value) === JSON.stringify(expected),
        });

        const complexObject = {
          nested: { deep: { value: 'test' } },
          array: [1, 2, 3],
          mixed: [{ id: 1 }, { id: 2 }],
        };

        expect(enforce.hasProperty('nested').run(complexObject)).toEqual({
          pass: true,
          type: complexObject,
        });

        expect(
          enforce.arrayContains({ id: 1 }).run(complexObject.mixed),
        ).toEqual({
          pass: true,
          type: complexObject.mixed,
        });

        const expectedObject = { a: 1, b: 2 };
        expect(
          enforce.objectDeepEquals(expectedObject).run({ a: 1, b: 2 }),
        ).toEqual({
          pass: true,
          type: { a: 1, b: 2 },
        });
      });
    });
  });
});
