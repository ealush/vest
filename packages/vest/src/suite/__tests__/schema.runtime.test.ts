import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from '../../vest';

describe('Schema Runtime Validation', () => {
  const schema = enforce.shape({
    name: enforce.isString(),
    age: enforce.isNumber(),
    tags: enforce.isArray(),
  });

  const suite = create(data => {
    test('name', 'Name must be present', () => {
      enforce(data.name).isNotBlank();
    });
  }, schema);

  describe('run() validation behavior', () => {
    it('should validate schema when no focus criteria is active', () => {
      // Valid data
      expect(suite.run({ name: 'John', age: 30, tags: [] }).isValid()).toBe(
        true,
      );

      // Invalid data
      // @ts-expect-error - Invalid data
      const result = suite.run({ name: 'John', age: '30' });
      expect(result.hasErrors()).toBe(true);
      expect(result.hasErrors('age')).toBe(true);
    });

    it('should skip schema validation when "only" is active', () => {
      // Invalid data for schema (age is string), but we focus on 'name'
      // The schema validation should be skipped entirely
      const result = suite
        .focus({ only: 'name' })
        // @ts-expect-error - Invalid data
        .run({ name: 'John', age: '30' });

      expect(result.hasErrors('age')).toBe(false);
      expect(result.isValid()).toBe(true);
    });

    it('should skip schema validation when "only" is active via suite.focus().run()', () => {
      // Invalid data for schema
      const result = suite
        .focus({ only: ['name'] })
        // @ts-expect-error - Invalid data
        .run({ name: 'John', age: '30' });

      expect(result.hasErrors('age')).toBe(false);
      expect(result.isValid()).toBe(true);
    });
  });

  describe('runStatic() validation behavior', () => {
    it('should always run schema validation', () => {
      // Valid data
      expect(
        suite.runStatic({ name: 'John', age: 30, tags: [] }).isValid(),
      ).toBe(true);

      // Invalid data - age is a string instead of number
      // @ts-expect-error - Invalid data
      const result = suite.runStatic({ name: 'John', age: '30', tags: [] });
      expect(result.hasErrors()).toBe(true);
      expect(result.hasErrors('age')).toBe(true);
    });

    it('should run schema validation even after focusing the main suite', () => {
      // Focus the main suite
      suite.focus({ only: 'name' });

      // runStatic should still validate schema (it creates a fresh suite)
      // @ts-expect-error - Invalid data
      const result = suite.runStatic({ name: 'John', age: '30', tags: [] });
      expect(result.hasErrors()).toBe(true);
      expect(result.hasErrors('age')).toBe(true);
    });
  });

  describe('Custom messages', () => {
    it('should wire custom messages from schema validation using .message()', () => {
      const schemaWithCustomMessage = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber().message('Age must be a valid number'),
        email: enforce.isString().message('Email must be a string'),
      });

      const suiteWithCustomMessages = create(data => {
        test('name', () => {
          enforce(data.name).isNotEmpty();
        });
      }, schemaWithCustomMessage);

      // Schema will fail on first error (age), so email won't be validated
      const result = suiteWithCustomMessages.runStatic({
        name: 'John',
        age: 'not a number',
        email: 123,
      } as any);

      expect(result.hasErrors('age')).toBe(true);

      // Verify custom message is included
      expect(result.getErrors('age')).toContain('Age must be a valid number');
    });

    it('should use default message when no custom message is provided', () => {
      const schemaWithDefaultMessage = enforce.shape({
        count: enforce.isNumber(),
      });

      const suiteWithDefaultMessage = create(
        () => {},
        schemaWithDefaultMessage,
      );

      const result = suiteWithDefaultMessage.runStatic({
        count: 'not a number',
      } as any);

      // Schema validation should create a test failure
      expect(result.hasErrors('count')).toBe(true);
      expect(result.isValid()).toBe(false);
    });

    it('should handle nested schema failures with custom messages', () => {
      const nestedSchema = enforce.shape({
        user: enforce.shape({
          name: enforce.isString().message('User name must be a string'),
          age: enforce.isNumber().message('User age must be a number'),
        }),
      });

      const nestedSuite = create(() => {}, nestedSchema);

      const result = nestedSuite.runStatic({
        user: { name: 123, age: 'thirty' },
      } as any);

      // Schema will report the first failure under 'user' field
      expect(result.hasErrors('user')).toBe(true);
      const errors = result.getErrors('user');

      // The error message should be one of the nested field's custom messages
      expect(errors).toContain('User name must be a string');
    });

    it('should work with run() without focus', () => {
      const schemaWithMessage = enforce.shape({
        price: enforce.isNumber().message('Price must be a number'),
      });

      const testSuite = create(() => {}, schemaWithMessage);

      const result = testSuite.run({ price: 'free' } as any);

      expect(result.hasErrors('price')).toBe(true);
      expect(result.getErrors('price')).toContain('Price must be a number');
    });

    it('should not run with focus enabled', () => {
      const schemaWithMessage = enforce.shape({
        price: enforce.isNumber().message('Price must be a number'),
        quantity: enforce.isNumber().message('Quantity must be a number'),
      });

      const testSuite = create(_data => {
        test('quantity', () => {
          // Test passes
        });
      }, schemaWithMessage);

      // Focus on quantity, invalid price should be ignored
      const result = testSuite.focus({ only: 'quantity' }).run({
        price: 'invalid',
        quantity: 10,
      } as any);

      expect(result.hasErrors('price')).toBe(false);
      expect(result.isValid()).toBe(true);
    });
  });

  describe('Extensive scenarios', () => {
    it('should handle partial data validation when not focused', () => {
      const partialSuite = create(
        () => {},
        enforce.shape({
          optional: enforce.optional(enforce.isString()),
        }),
      );

      expect(partialSuite.run({}).hasErrors()).toBe(false);
      // @ts-expect-error - Invalid data
      expect(partialSuite.run({ optional: 123 }).hasErrors()).toBe(true);
    });

    it('should populate result.types with data', () => {
      const s = create(
        _data => {},
        enforce.shape({ name: enforce.isString() }),
      );
      const res = s.run({ name: 'Test' });

      expect(res.types).toHaveProperty('input', { name: 'Test' });
      expect(res.types).toHaveProperty('output', { name: 'Test' });
    });

    it('should fail if extra fields are present when using enforce.shape (strict)', () => {
      const strictSchema = enforce.shape({
        field: enforce.isString(),
      });
      const s = create(() => {}, strictSchema);
      // @ts-expect-error - Invalid data
      expect(s.run({ field: 'yes', extra: 'no' }).hasErrors()).toBe(true);
    });

    it('should pass if extra fields are present when using enforce.loose', () => {
      const looseSchema = enforce.loose({
        field: enforce.isString(),
      });
      const s = create(() => {}, looseSchema);
      expect(s.run({ field: 'yes', extra: 'no' }).hasErrors()).toBe(false);
    });
  });

  describe('isArrayOf', () => {
    it('should fail with correct path when item at index fails', () => {
      const schema = enforce.shape({
        tags: enforce.isArrayOf(enforce.isString()),
      });

      const res = schema.run({
        tags: ['valid', 123, 'valid'],
      });

      expect(res.pass).toBe(false);
      expect(res.path).toEqual(['tags', '1']);
    });

    it('should fail with correct nested path when item at index fails nested validation', () => {
      const schema = enforce.shape({
        users: enforce.isArrayOf(
          enforce.shape({
            name: enforce.isString(),
            age: enforce.isNumber(),
          }),
        ),
      });

      const res = schema.run({
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: '25' }, // Invalid age
        ],
      });

      expect(res.pass).toBe(false);
      expect(res.path).toEqual(['users', '1', 'age']);
    });
  });

  describe('Stateful behavior', () => {
    it('should run schema validation only when not focused even if ran focused previously', () => {
      const schema = enforce.shape({
        required: enforce.isString(),
      });

      const suite = create(_data => {
        test('field', () => {});
      }, schema);

      // First run: Focused
      // Schema validation should be skipped
      // @ts-expect-error - Invalid data
      let res = suite.focus({ only: 'field' }).run({ required: 123 });

      expect(res.hasErrors()).toBe(false);
      expect(res.isValid()).toBe(true);

      // Second run: Not focused
      // Schema validation should run and fail
      // @ts-expect-error - Invalid data
      res = suite.run({ required: 123 });
      expect(res.hasErrors()).toBe(true);
      expect(res.hasErrors('required')).toBe(true);
    });
  });
});
