import { describe, expect, it } from 'vitest';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { enforce } from '../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      toNumberForParse: (value: unknown) => {
        message: string;
        pass: boolean;
        type: number;
      };
    }
  }
}

/**
 * Helper type that combines both branches of StandardSchemaV1.Result
 * into a single type where both `value` and `issues` are optional.
 * This allows direct property access in test assertions without
 * requiring type narrowing or `as any` casts.
 */
type ValidateResult<T = unknown> = {
  readonly value?: T;
  readonly issues?: ReadonlyArray<StandardSchemaV1.Issue>;
};

/**
 * Casts a StandardSchemaV1.Result (or its Promise-union variant) to
 * a ValidateResult so both `.value` and `.issues` are accessible.
 */
function asResult<T>(
  result: StandardSchemaV1.Result<T> | Promise<StandardSchemaV1.Result<T>>,
): ValidateResult<T> {
  return result as ValidateResult<T>;
}

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

      const validResult = asResult(validator['~standard'].validate('hello'));
      expect(validResult).toHaveProperty('value');
      expect(validResult.value).toBe('hello');
      expect(validResult.issues).toBeUndefined();
    });

    it('Should implement validate method matching StandardSchema spec - failure case', () => {
      const validator = enforce.isString();

      const invalidResult = asResult(validator['~standard'].validate(123));
      expect(invalidResult).toHaveProperty('issues');
      expect(invalidResult).not.toHaveProperty('value');
      expect(Array.isArray(invalidResult.issues)).toBe(true);
      expect(invalidResult.issues?.length).toBeGreaterThan(0);
    });

    it('Should include message in issues array', () => {
      const validator = enforce.isString();

      const invalidResult = asResult(validator['~standard'].validate(123));
      expect(invalidResult.issues).toBeDefined();
      expect(invalidResult.issues?.[0]).toHaveProperty('message');
      expect(typeof invalidResult.issues?.[0].message).toBe('string');
    });

    it('Should include path in issues array', () => {
      const validator = enforce.isString();

      const invalidResult = asResult(validator['~standard'].validate(123));
      expect(invalidResult.issues).toBeDefined();
      expect(invalidResult.issues?.[0]).toHaveProperty('path');
      expect(Array.isArray(invalidResult.issues?.[0].path)).toBe(true);
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

    expect(enforce.toNumberForParse().parse('12')).toBe(12);
  });

  describe('Direct validate() method usage', () => {
    it('should expose .validate() as a direct method', () => {
      const validator = enforce.equals(5);
      expect(typeof validator.validate).toBe('function');
    });

    it('should return success result for valid input', () => {
      const validator = enforce.equals(5);
      const res = asResult(validator.validate(5));
      expect(res.value).toBe(5);
      expect(res.issues).toBeUndefined();
    });

    it('should return failure result for invalid input', () => {
      const validator = enforce.equals(5);
      const res = asResult(validator.validate(10));
      expect(res.value).toBeUndefined();
      expect(res.issues).toBeDefined();
      expect(res.issues?.length).toBeGreaterThan(0);
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

      const res = asResult(
        shape['~standard'].validate({ name: 'Bob', age: 30 }),
      );
      expect(res.value).toEqual({ name: 'Bob', age: 30 });
      expect(res.issues).toBeUndefined();
    });

    it('enforce.shape should fail with invalid data', () => {
      const shape = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      const res = asResult(
        shape['~standard'].validate({ name: 'Bob', age: 'thirty' }),
      );
      expect(res.value).toBeUndefined();
      expect(res.issues).toBeDefined();
      expect(res.issues?.length).toBeGreaterThan(0);
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

      const stringResult = asResult(validator['~standard'].validate('hello'));
      expect(stringResult.value).toBe('hello');
      expect(stringResult.issues).toBeUndefined();

      const numberResult = asResult(validator['~standard'].validate(42));
      expect(numberResult.value).toBe(42);
      expect(numberResult.issues).toBeUndefined();

      const invalidResult = asResult(validator['~standard'].validate(true));
      expect(invalidResult.value).toBeUndefined();
      expect(invalidResult.issues).toBeDefined();
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

      const validResult = asResult(validator['~standard'].validate(50));
      expect(validResult.value).toBe(50);
      expect(validResult.issues).toBeUndefined();

      const invalidResult = asResult(validator['~standard'].validate(150));
      expect(invalidResult.value).toBeUndefined();
      expect(invalidResult.issues).toBeDefined();
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

      const validResult = asResult(
        validator['~standard'].validate(['a', 'b', 'c']),
      );
      expect(validResult.value).toEqual(['a', 'b', 'c']);
      expect(validResult.issues).toBeUndefined();

      const invalidResult = asResult(
        validator['~standard'].validate([1, 2, 3]),
      );
      expect(invalidResult.value).toBeUndefined();
      expect(invalidResult.issues).toBeDefined();
    });
  });
});
