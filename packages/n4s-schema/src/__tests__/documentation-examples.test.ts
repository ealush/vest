import { describe, it, expect } from 'vitest';
import { enforce, compose, ctx } from '../n4s-schema';

describe('Documentation Examples', () => {
  describe('compose examples', () => {
    it('should validate username with composed rule', () => {
      const isValidUsername = compose(
        enforce.isString()
          .longerThan(3)
          .shorterThan(20)
          .matches(/^[a-zA-Z0-9_]+$/)
      );

      expect(isValidUsername.test('john_doe')).toBe(true);
      expect(isValidUsername.test('ab')).toBe(false); // too short
      expect(isValidUsername.test('john doe')).toBe(false); // contains space
    });

    it('should use composed rule in schema validation', () => {
      const isValidUsername = compose(
        enforce.isString()
          .longerThan(3)
          .shorterThan(20)
          .matches(/^[a-zA-Z0-9_]+$/)
      );

      const result = enforce({ username: 'john_doe' }).shape({
        username: isValidUsername
      });

      expect(result.pass).toBe(true);
    });
  });

  describe('enforce examples', () => {
    it('should validate with eager API', () => {
      expect(() => {
        enforce('hello').isString().longerThan(3);
      }).not.toThrow();

      expect(() => {
        enforce('hi').isString().longerThan(3);
      }).toThrow();
    });

    it('should validate with lazy API', () => {
      const stringRule = enforce.isString();
      expect(stringRule.test('hello')).toBe(true);
      
      const result = stringRule.run('hello');
      expect(result.pass).toBe(true);
      expect(result.type).toBe('hello');
    });

    it('should support custom messages', () => {
      expect(() => {
        enforce('').message('Field is required').isNotEmpty();
      }).toThrow('Field is required');
    });

    it('should validate with schema', () => {
      const result = enforce({ name: 'John', age: 30 }).shape({
        name: enforce.isString(),
        age: enforce.isNumber()
      });

      expect(result.pass).toBe(true);
    });
  });

  describe('enforce.context examples', () => {
    it('should access validation context', () => {
      const stringRule = enforce.isString();
      const result = stringRule.run('test');
      
      // Context is only available during rule execution
      expect(result.pass).toBe(true);
    });
  });

  describe('enforce.extend examples', () => {
    it('should extend with custom rules', () => {
      enforce.extend({
        isPositive: (value: number) => value > 0,
        isBetween: (value: number, min: number, max: number) => 
          value >= min && value <= max
      });

      // Eager API
      expect(() => {
        (enforce(5) as any).isPositive();
      }).not.toThrow();

      expect(() => {
        (enforce(-5) as any).isPositive();
      }).toThrow();

      // Lazy API
      const rule = (enforce as any).isPositive();
      expect(rule.test(5)).toBe(true);
      expect(rule.test(-3)).toBe(false);
    });
  });

  describe('RuleInstance examples', () => {
    it('should work with RuleInstance', () => {
      const stringRule = enforce.isString();
      
      // test method returns boolean
      expect(stringRule.test('hello')).toBe(true);
      expect(stringRule.test(123)).toBe(false);
      
      // run method returns RuleRunReturn
      const result = stringRule.run('hello');
      expect(result.pass).toBe(true);
      expect(result.type).toBe('hello');
    });

    it('should chain rules', () => {
      const rule = enforce.isString().longerThan(3);
      expect(rule.test('hello')).toBe(true);
      expect(rule.test('hi')).toBe(false);
    });
  });

  describe('RuleRunReturn examples', () => {
    it('should create passing result', () => {
      const rule = enforce.isString();
      const result = rule.run('hello');
      
      expect(result.pass).toBe(true);
      expect(result.type).toBe('hello');
      expect(result.message).toBeUndefined();
    });

    it('should create failing result with message', () => {
      const rule = enforce.isString().message('Must be a string');
      const result = rule.run(123);
      
      expect(result.pass).toBe(false);
      expect(result.message).toBe('Must be a string');
    });
  });

  describe('schema rule examples', () => {
    it('should validate with shape', () => {
      const userSchema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
        email: enforce.isString()
      });

      expect(userSchema.test({
        name: 'John',
        age: 30,
        email: 'john@example.com'
      })).toBe(true);

      expect(userSchema.test({
        name: 'John',
        age: 'thirty', // wrong type
        email: 'john@example.com'
      })).toBe(false);
    });

    it('should validate with loose', () => {
      const schema = enforce.loose({
        name: enforce.isString(),
        age: enforce.isNumber()
      });

      // Allows extra properties
      expect(schema.test({
        name: 'John',
        age: 30,
        extra: 'allowed'
      })).toBe(true);
    });

    it('should validate with partial', () => {
      const schema = enforce.partial({
        name: enforce.isString(),
        age: enforce.isNumber()
      });

      // All properties optional
      expect(schema.test({})).toBe(true);
      expect(schema.test({ name: 'John' })).toBe(true);
      expect(schema.test({ age: 30 })).toBe(true);
    });

    it('should validate with optional', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        age: enforce.optional(enforce.isNumber())
      });

      expect(schema.test({ name: 'John' })).toBe(true);
      expect(schema.test({ name: 'John', age: 30 })).toBe(true);
      expect(schema.test({ name: 'John', age: undefined })).toBe(true);
    });

    it('should validate with isArrayOf', () => {
      const numbersRule = enforce.isArrayOf(enforce.isNumber());

      expect(numbersRule.test([1, 2, 3])).toBe(true);
      expect(numbersRule.test([1, 'two', 3])).toBe(false);
    });
  });

  describe('compound rule examples', () => {
    it('should validate with allOf', () => {
      const rule = enforce.allOf(
        enforce.isNumber().greaterThan(0).lessThan(100)
      );

      expect(rule.test(50)).toBe(true);
      expect(rule.test(150)).toBe(false);
    });

    it('should validate with anyOf', () => {
      const rule = enforce.anyOf(
        enforce.isString(),
        enforce.isNumber()
      );

      expect(rule.test('hello')).toBe(true);
      expect(rule.test(123)).toBe(true);
      expect(rule.test(true)).toBe(false);
    });

    it('should validate with noneOf', () => {
      const rule = enforce.noneOf(
        enforce.isNull(),
        enforce.isUndefined()
      );

      expect(rule.test('hello')).toBe(true);
      expect(rule.test(null)).toBe(false);
      expect(rule.test(undefined)).toBe(false);
    });

    it('should validate with oneOf', () => {
      const rule = enforce.oneOf(
        enforce.isString(),
        enforce.isNumber()
      );

      expect(rule.test('hello')).toBe(true);
      expect(rule.test(123)).toBe(true);
    });
  });

  describe('type validation examples', () => {
    it('should validate arrays', () => {
      const rule = enforce.isArray();
      expect(rule.test([1, 2, 3])).toBe(true);
      expect(rule.test('not array')).toBe(false);
    });

    it('should validate strings', () => {
      const rule = enforce.isString();
      expect(rule.test('hello')).toBe(true);
      expect(rule.test(123)).toBe(false);
    });

    it('should validate numbers', () => {
      const rule = enforce.isNumber();
      expect(rule.test(123)).toBe(true);
      expect(rule.test('123')).toBe(false);
    });

    it('should validate booleans', () => {
      const rule = enforce.isBoolean();
      expect(rule.test(true)).toBe(true);
      expect(rule.test('true')).toBe(false);
    });

    it('should validate null', () => {
      const rule = enforce.isNull();
      expect(rule.test(null)).toBe(true);
      expect(rule.test(undefined)).toBe(false);
    });

    it('should validate undefined', () => {
      const rule = enforce.isUndefined();
      expect(rule.test(undefined)).toBe(true);
      expect(rule.test(null)).toBe(false);
    });

    it('should validate nullish', () => {
      const rule = enforce.isNullish();
      expect(rule.test(null)).toBe(true);
      expect(rule.test(undefined)).toBe(true);
      expect(rule.test(0)).toBe(false);
    });

    it('should validate numeric', () => {
      const rule = enforce.isNumeric();
      expect(rule.test(123)).toBe(true);
      expect(rule.test('123')).toBe(true);
      expect(rule.test('abc')).toBe(false);
    });
  });

  describe('extendEnforce examples', () => {
    it('should extend with custom rules and use in both APIs', () => {
      enforce.extend({
        isEven: (value: number) => value % 2 === 0
      });

      // Eager API
      expect(() => {
        (enforce(10) as any).isEven();
      }).not.toThrow();

      expect(() => {
        (enforce(11) as any).isEven();
      }).toThrow();

      // Lazy API
      const evenRule = (enforce as any).isEven();
      expect(evenRule.test(10)).toBe(true);
      expect(evenRule.test(11)).toBe(false);
    });

    it('should combine custom rules with built-in rules', () => {
      enforce.extend({
        isPositiveNumber: (value: number) => value > 0,
        isBetweenRange: (value: number, min: number, max: number) => 
          value >= min && value <= max
      });

      const schema = enforce.shape({
        age: (enforce as any).isNumber().isPositiveNumber().isBetweenRange(18, 100),
        score: (enforce as any).isNumber().isEven()
      });

      expect(schema.test({ age: 25, score: 100 })).toBe(true);
      expect(schema.test({ age: -5, score: 100 })).toBe(false);
      expect(schema.test({ age: 25, score: 99 })).toBe(false);
    });
  });
});
