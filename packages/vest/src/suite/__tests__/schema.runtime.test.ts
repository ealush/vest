import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from '../../vest';

describe('Schema Runtime Validation', () => {
  enforce.extend({
    toNumber: (value: unknown) => {
      const parsed = Number(value);
      return Number.isNaN(parsed)
        ? { pass: false, type: value }
        : { pass: true, type: parsed };
    },
  });
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

    it('should validate only the focused fields when "only" is active', () => {
      // Invalid data for schema (age is string), but we focus on 'name'
      // The schema validation should pick 'name' and skip 'age'
      const result = suite
        .focus({ only: 'name' })
        // @ts-expect-error - Invalid data
        .run({ name: 'John', age: '30' });

      expect(result.hasErrors('age')).toBe(false);
      expect(result.isValid()).toBe(true);
    });

    it('should validate only the focused fields when "only" is active via suite.focus().run()', () => {
      // Invalid data for schema
      const result = suite
        .focus({ only: ['name'] })
        // @ts-expect-error - Invalid data
        .run({ name: 'John', age: '30' });

      expect(result.hasErrors('age')).toBe(false);
      expect(result.isValid()).toBe(true);
    });

    it('should drop intersected fields and parse schemas securely when only and skip intersect', () => {
      // Only runs fields uniquely listed in `only` missing from `skip` natively.
      // Expected execution: 'name' evaluates. 'age' and 'tags' bypass safely.
      const result = suite
        .focus({ only: ['name', 'age'], skip: 'age' })
        // @ts-expect-error - Invalid data
        .run({ name: 'John', age: 'thirty', tags: 'invalid_array' });

      // Validating assertions
      expect(result.hasErrors('name')).toBe(false); // Valid string evaluates correctly
      expect(result.hasErrors('age')).toBe(false); // Skipped cleanly
      expect(result.hasErrors('tags')).toBe(false); // Implicitly bypassed because it's missing from `only`

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
      });

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
        // @ts-expect-error - testing invalid input
        count: 'not a number',
      });

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

      const nestedSuite = create<null>(() => {}, nestedSchema);

      const result = nestedSuite.runStatic({
        user: { name: 123, age: 'thirty' },
      });

      // Schema reports nested paths with full field specificity
      expect(result.hasErrors('user.name')).toBe(true);
      const errors = result.getErrors('user.name');

      // The error message should be one of the nested field's custom messages
      expect(errors).toContain('User name must be a string');
    });

    it('should work with run() without focus', () => {
      const schemaWithMessage = enforce.shape({
        price: enforce.isNumber().message('Price must be a number'),
      });

      const testSuite = create(() => {}, schemaWithMessage);

      const result = testSuite.run({ price: 'free' });

      expect(result.hasErrors('price')).toBe(true);
      expect(result.getErrors('price')).toContain('Price must be a number');
    });

    it('should only validate focused schema fields with focus enabled', () => {
      const schemaWithMessage = enforce.shape({
        price: enforce.isNumber().message('Price must be a number'),
        quantity: enforce.isNumber().message('Quantity must be a number'),
      });

      const testSuite = create(_data => {
        test('quantity', () => {
          // Test passes
        });
      }, schemaWithMessage);

      // Focus on quantity, invalid price should be ignored naturally by `pick`
      const result = testSuite.focus({ only: 'quantity' }).run({
        price: 'invalid', // should be naturally dropped from validation
        quantity: 10,
      });

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
        // @ts-expect-error - Invalid data: 123 is not a string
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
          // @ts-expect-error - Invalid data: '25' is not a number
          { name: 'Jane', age: '25' }, // Invalid age
        ],
      });

      expect(res.pass).toBe(false);
      expect(res.path).toEqual(['users', '1', 'age']);
    });
  });

  describe('Parsed schema output', () => {
    it('should pass parsed schema output into the suite callback', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
      });

      let receivedAge: unknown;
      const parsedSuite = create(data => {
        receivedAge = data.age;
        test('age', () => {
          enforce(data.age).isNumber();
        });
      }, schema);

      // @ts-expect-error - testing parser coercion: age is string '32' that gets parsed to number
      const result = parsedSuite.run({ age: '32' });

      expect(receivedAge).toBe(32);
      expect(result.value).toEqual({ age: 32 });
      // @ts-expect-error - types is defined at runtime when schema is used, but typed as undefined in SuiteResult return
      expect(result.types?.output).toEqual({ age: 32 });
    });
  });

  describe('Parsed schema output metadata', () => {
    it('should expose transformed data on data.parsed using enforce parsers (trim, toNumber)', () => {
      const schema = enforce.shape({
        name: enforce.isString().trim().toUpper(),
        age: enforce.isNumeric().toNumber(),
      });

      const suite = create(() => {}, schema);

      // @ts-expect-error - testing parser coercion: age is string
      const result = suite.run({ name: '  bob  ', age: '30' });

      // raw is the single-run transformed output
      expect(result.run.data.raw).toEqual({ name: 'BOB', age: 30 });

      // parsed also holds the same transformed values
      expect(result.run.data.parsed).toEqual({ name: 'BOB', age: 30 });

      // Proves the parsers ran: original was '  bob  ' (string), now 'BOB' (trimmed, uppercased)
      // and original age was '30' (string), now 30 (number)
      expect(typeof (result.run.data.parsed as any).age).toBe('number');
      expect((result.run.data.parsed as any).name).toBe('BOB');
    });

    it('should cumulatively assign parsed data across focused suite runs using enforce parsers', () => {
      const schema = enforce.shape({
        username: enforce.isString().trim().toLower(),
        score: enforce.isNumeric().toNumber(),
      });

      const suite = create(() => {}, schema);

      // Run 1: focus on username only
      const res1 = suite
        .focus({ only: 'username' })
        .run({ username: '  Alice  ' } as any);

      expect(res1.run.data.raw).toEqual({ username: 'alice' });
      expect(res1.run.data.parsed).toEqual({ username: 'alice' });

      // Run 2: focus on score only
      const res2 = suite.focus({ only: 'score' }).run({ score: '99' } as any);

      // raw is ONLY the current run's transformed value
      expect(res2.run.data.raw).toEqual({ score: 99 });

      // parsed cumulatively merges: username from Run 1 is still 'alice' (trimmed + lowercased)
      expect(res2.run.data.parsed).toEqual({ username: 'alice', score: 99 });

      // Prove type persistence: score is number, not string
      expect(typeof (res2.run.data.parsed as any).score).toBe('number');
      // And username from Run 1 is still present as 'alice'
      expect((res2.run.data.parsed as any).username).toBe('alice');
    });
  });

  describe('Stateful behavior', () => {
    it('should run schema validation dynamically based on focus per execution', () => {
      const schema = enforce.shape({
        required: enforce.isString(),
        field: enforce.optional(enforce.isString()), // Define 'field' so it's a valid generic for .only()
      });

      const suite = create(_data => {
        test('field', () => {});
      }, schema);

      // First run: Focused
      // Schema validation should pick 'field' and ignore 'required'
      let res = suite.focus({ only: 'field' }).run({
        // @ts-expect-error - Invalid data skipped by focus filtering
        required: 123,
      });

      expect(res.hasErrors()).toBe(false);
      expect(res.isValid()).toBe(true);

      // Second run: Not focused
      // Schema validation should pick all fields intrinsically and fail
      // @ts-expect-error - Invalid data
      res = suite.run({ required: 123 });
      expect(res.hasErrors()).toBe(true);
      expect(res.hasErrors('required')).toBe(true);
    });

    it('should maintain state of previously tested fields during focused runs', () => {
      const schema = enforce.shape({
        field1: enforce.isString(),
        field2: enforce.isString(),
      });

      const suite = create(data => {
        test('field1', () => {
          enforce(data.field1).isNotBlank();
        });
        test('field2', () => {
          enforce(data.field2).isNotBlank();
        });
      }, schema);
      expect(suite.get().isValid('field1')).toBe(false);
      expect(suite.get().isValid('field2')).toBe(false);

      // First run: Both fields
      suite.run({ field1: 'value1', field2: 'value2' });
      expect(suite.get().isValid('field1')).toBe(true);
      expect(suite.get().isValid('field2')).toBe(true);

      // Second run: Focused on field1 only. field2 should remain valid from previous run.
      suite
        .focus({ only: 'field1' })
        // @ts-expect-error - Invalid data
        .run({ field1: null, field2: 'value2' });

      expect(suite.get().isValid('field1')).toBe(false);
      expect(suite.get().isValid('field2')).toBe(true); // Should remain valid from first run
      expect(suite.get().testCount).toBe(2); // Both tests should be in the result
    });
  });
});
