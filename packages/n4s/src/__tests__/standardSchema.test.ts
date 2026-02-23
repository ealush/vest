import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

describe('n4s StandardSchema Support', () => {
  describe('Lazy Interface', () => {
    it('Should have the "~standard" property', () => {
      const validator = enforce.isString();
      expect(validator).toHaveProperty('~standard');
    });

    it('Should have ~standard.version === 1', () => {
      const validator = enforce.isString();
      expect(validator['~standard'].version).toBe(1);
    });

    it('Should have ~standard.vendor === "n4s"', () => {
      const validator = enforce.isString();
      expect(validator['~standard'].vendor).toBe('n4s');
    });

    it('Should have ~standard.validate function', () => {
      const validator = enforce.isString();
      expect(typeof validator['~standard'].validate).toBe('function');
    });

    it('Should implement validate method matching StandardSchema spec - success case', () => {
      const validator = enforce.isString();

      const validResult = validator['~standard'].validate('hello');
      expect(validResult).toHaveProperty('value');
      expect((validResult as any).value).toBe('hello');
      expect((validResult as any).issues).toBeUndefined();
    });

    it('Should implement validate method matching StandardSchema spec - failure case', () => {
      const validator = enforce.isString();

      const invalidResult = validator['~standard'].validate(123);
      expect(invalidResult).toHaveProperty('issues');
      expect(invalidResult).not.toHaveProperty('value');
      expect(Array.isArray((invalidResult as any).issues)).toBe(true);
      expect((invalidResult as any).issues?.length).toBeGreaterThan(0);
    });

    it('Should include message in issues array', () => {
      const validator = enforce.isString();

      const invalidResult = validator['~standard'].validate(123);
      expect((invalidResult as any).issues).toBeDefined();
      expect((invalidResult as any).issues?.[0]).toHaveProperty('message');
      expect(typeof (invalidResult as any).issues?.[0].message).toBe('string');
    });

    it('Should include path in issues array', () => {
      const validator = enforce.isString();

      const invalidResult = validator['~standard'].validate(123);
      expect((invalidResult as any).issues).toBeDefined();
      expect((invalidResult as any).issues?.[0]).toHaveProperty('path');
      expect(Array.isArray((invalidResult as any).issues?.[0].path)).toBe(true);
    });
  });

  it('should expose .parse() and return transformed value when valid', async () => {
    const { enforce } = await import('../n4s');
    enforce.extend({
      toNumberForParse: (value: any) => {
        const parsed = Number(value);
        return {
          pass: !Number.isNaN(parsed),
          type: parsed,
          message: 'not numeric',
        };
      },
    });

    expect((enforce as any).toNumberForParse().parse('12')).toBe(12);
  });

  describe('Direct validate() method usage', () => {
    it('should expose .validate() as a direct method', () => {
      const validator = enforce.equals(5);
      expect(typeof validator.validate).toBe('function');
    });

    it('should return success result for valid input', () => {
      const validator = enforce.equals(5);
      const res = validator.validate(5);
      expect((res as any).value).toBe(5);
      expect((res as any).issues).toBeUndefined();
    });

    it('should return failure result for invalid input', () => {
      const validator = enforce.equals(5);
      const res = validator.validate(10);
      expect((res as any).value).toBeUndefined();
      expect((res as any).issues).toBeDefined();
      expect((res as any).issues?.length).toBeGreaterThan(0);
    });
  });

  describe('Shape/Schema Rules', () => {
    it('enforce.shape should have ~standard property', () => {
      const shape = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      expect(shape['~standard']).toBeDefined();
      expect(shape['~standard'].version).toBe(1);
      expect(shape['~standard'].vendor).toBe('n4s');
    });

    it('enforce.shape should validate successfully with valid data', () => {
      const shape = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      const res = shape['~standard'].validate({ name: 'Bob', age: 30 });
      expect((res as any).value).toEqual({ name: 'Bob', age: 30 });
      expect((res as any).issues).toBeUndefined();
    });

    it('enforce.shape should fail with invalid data', () => {
      const shape = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      const res = shape['~standard'].validate({ name: 'Bob', age: 'thirty' });
      expect((res as any).value).toBeUndefined();
      expect((res as any).issues).toBeDefined();
      expect((res as any).issues?.length).toBeGreaterThan(0);
    });

    it('enforce.loose should have ~standard property', () => {
      const loose = enforce.loose({
        name: enforce.isString(),
      });

      expect(loose['~standard']).toBeDefined();
      expect(loose['~standard'].version).toBe(1);
    });

    it('enforce.partial should have ~standard property', () => {
      const partial = enforce.partial({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      expect(partial['~standard']).toBeDefined();
      expect(partial['~standard'].version).toBe(1);
    });
  });

  describe('Compound Rules', () => {
    it('enforce.anyOf should have ~standard property', () => {
      const validator = enforce.anyOf(enforce.isNumber(), enforce.isString());

      expect(validator['~standard']).toBeDefined();
      expect(validator['~standard'].version).toBe(1);
      expect(validator['~standard'].vendor).toBe('n4s');
    });

    it('enforce.anyOf should validate correctly', () => {
      const validator = enforce.anyOf(enforce.isNumber(), enforce.isString());

      const stringResult = validator['~standard'].validate('hello');
      expect((stringResult as any).value).toBe('hello');
      expect((stringResult as any).issues).toBeUndefined();

      const numberResult = validator['~standard'].validate(42);
      expect((numberResult as any).value).toBe(42);
      expect((numberResult as any).issues).toBeUndefined();

      const invalidResult = validator['~standard'].validate(true);
      expect((invalidResult as any).value).toBeUndefined();
      expect((invalidResult as any).issues).toBeDefined();
    });

    it('enforce.allOf should have ~standard property', () => {
      const validator = enforce.allOf(
        enforce.isNumber(),
        enforce.isNumber().greaterThan(0),
      );

      expect(validator['~standard']).toBeDefined();
      expect(validator['~standard'].version).toBe(1);
    });

    it('enforce.oneOf should have ~standard property', () => {
      const validator = enforce.oneOf(enforce.isNumber(), enforce.isString());

      expect(validator['~standard']).toBeDefined();
      expect(validator['~standard'].version).toBe(1);
    });
  });

  describe('Chained Rules', () => {
    it('should support chained rules with ~standard', () => {
      const validator = enforce.isNumber().greaterThan(0).lessThan(100);

      expect(validator['~standard']).toBeDefined();
      expect(validator['~standard'].version).toBe(1);
    });

    it('should validate chained rules correctly', () => {
      const validator = enforce.isNumber().greaterThan(0).lessThan(100);

      const validResult = validator['~standard'].validate(50);
      expect((validResult as any).value).toBe(50);
      expect((validResult as any).issues).toBeUndefined();

      const invalidResult = validator['~standard'].validate(150);
      expect((invalidResult as any).value).toBeUndefined();
      expect((invalidResult as any).issues).toBeDefined();
    });
  });

  describe('Array Validators', () => {
    it('enforce.isArrayOf should have ~standard property', () => {
      const validator = enforce.isArrayOf(enforce.isString());

      expect(validator['~standard']).toBeDefined();
      expect(validator['~standard'].version).toBe(1);
    });

    it('enforce.isArrayOf should validate correctly', () => {
      const validator = enforce.isArrayOf(enforce.isString());

      const validResult = validator['~standard'].validate(['a', 'b', 'c']);
      expect((validResult as any).value).toEqual(['a', 'b', 'c']);
      expect((validResult as any).issues).toBeUndefined();

      const invalidResult = validator['~standard'].validate([1, 2, 3]);
      expect((invalidResult as any).value).toBeUndefined();
      expect((invalidResult as any).issues).toBeDefined();
    });
  });
});
