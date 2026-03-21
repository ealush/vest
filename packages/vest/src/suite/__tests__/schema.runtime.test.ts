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
      expect(result.getMessage('count')).toBeUndefined();
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

      const result = testSuite.run({ price: 'free' } as any);

      expect(result.hasErrors('price')).toBe(true);
      expect(result.getErrors('price')).toContain('Price must be a number');
    });

    it('should keep schema assertion messages empty when none are provided', () => {
      const schemaWithoutMessage = enforce.shape({
        price: enforce.isNumber(),
      });

      const testSuite = create(() => {}, schemaWithoutMessage);

      const result = testSuite.run({ price: 'free' } as any);

      expect(result.hasErrors('price')).toBe(true);
      expect(result.getMessage('price')).toBeUndefined();
      expect(result.getErrors('price')).toEqual([]);
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

      const result = parsedSuite.run({ age: '32' });

      expect(receivedAge).toBe(32);
      expect(result.value).toEqual({ age: 32 });
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

      const result = suite.run({ name: '  bob  ', age: '30' });

      // raw is the single-run transformed output
      expect(result.run.data.raw).toEqual({ name: 'BOB', age: 30 });

      // parsed also holds the same transformed values
      expect(result.run.data.parsed).toEqual({ name: 'BOB', age: 30 });

      // Proves the parsers ran: original was '  bob  ' (string), now 'BOB' (trimmed, uppercased)
      // and original age was '30' (string), now 30 (number)
      expect(typeof result.run.data.parsed?.age).toBe('number');
      expect(result.run.data.parsed?.age).toBe(30);
      expect(result.run.data.parsed?.name).toBe('BOB');
    });

    it('should assign isolated parsed data across focused suite runs using enforce parsers', () => {
      const schema = enforce.shape({
        username: enforce.isString().trim().toLower(),
        score: enforce.isNumeric().toNumber(),
      });

      const suite = create(() => {}, schema);

      // Run 1: focus on username only
      const res1 = suite
        .focus({ only: 'username' })
        .run({ username: '  Alice  ' });

      expect(res1.run.data.raw).toEqual({ username: 'alice' });
      expect(res1.run.data.parsed).toEqual({ username: 'alice' });

      // Run 2: focus on score only
      const res2 = suite.focus({ only: 'score' }).run({ score: '99' });

      // raw is ONLY the current run's transformed value
      expect(res2.run.data.raw).toEqual({ score: 99 });

      // parsed only contains the score
      expect(res2.run.data.parsed).toEqual({ score: 99 });

      // Prove type persistence: score is number, not string
      expect(typeof res2.run.data.parsed?.score).toBe('number');

      expect(res2.run.data.parsed?.username).toBeUndefined();
    });
  });

  describe('Mutation resilience', () => {
    it('should freeze parsed data snapshot so callback mutations do not affect run metadata', () => {
      const schema = enforce.shape({
        score: enforce.isNumeric().toNumber(),
      });

      let callbackRan = false;

      const suite = create(data => {
        callbackRan = true;
        // Maliciously mutate the input
        data.score = 500;
      }, schema);

      const result = suite.run({ score: '42' });

      expect(callbackRan).toBe(true);
      expect(result.run.data.parsed).toEqual({ score: 42 });
      expect(Object.isFrozen(result.run.data.parsed)).toBe(true);
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

describe('Schema input vs output type inference', () => {
  describe('isNumeric().toNumber() — input: string | number, output: number', () => {
    it('should accept string input without type error', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
      });
      const suite = create(data => {
        test('age', () => {
          enforce(data.age).isNumber();
        });
      }, schema);

      // string input is valid because isNumeric() accepts string | number
      const result = suite.run({ age: '25' });
      expect(result.hasErrors()).toBe(false);
      expect(result.isValid()).toBe(true);
      expect(result.value).toEqual({ age: 25 });
    });

    it('should accept number input without type error', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
      });
      const suite = create(data => {
        test('age', () => {
          enforce(data.age).isNumber();
        });
      }, schema);

      // number input is also valid
      const result = suite.run({ age: 25 });
      expect(result.isValid()).toBe(true);
      expect(result.value).toEqual({ age: 25 });
    });

    it('should coerce string to number in parsed output', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
      });
      const suite = create(data => {
        test('age', () => {
          enforce(data.age).isNumber();
        });
      }, schema);

      const result = suite.run({ age: '42' });
      expect(result.value).toEqual({ age: 42 });
      expect(typeof result.value?.age).toBe('number');

      // run.data holds the parsed value for both raw and parsed
      expect(result.run.data.raw).toEqual({ age: 42 });
      expect(result.run.data.parsed).toEqual({ age: 42 });
      expect(typeof result.run.data.parsed?.age).toBe('number');
    });
  });

  describe('isString().trim().toUpper() — input: string, output: string', () => {
    it('should accept string input and produce transformed string output', () => {
      const schema = enforce.shape({
        name: enforce.isString().trim().toUpper(),
      });
      const suite = create(data => {
        test('name', () => {
          enforce(data.name).isNotBlank();
        });
      }, schema);

      const result = suite.run({ name: '  alice  ' });
      expect(result.isValid()).toBe(true);
      expect(result.value).toEqual({ name: 'ALICE' });

      // types reflect the parsed data at runtime
      expect(result.types?.output).toEqual({ name: 'ALICE' });
    });
  });

  describe('isString().toBoolean() — input: string, output: boolean', () => {
    it('should accept string input and produce boolean output', () => {
      const schema = enforce.shape({
        active: enforce.isString().trim().toBoolean(),
      });
      const suite = create(data => {
        test('active', () => {
          enforce(data.active).isTruthy();
        });
      }, schema);

      const result = suite.run({ active: ' yes ' });
      expect(result.isValid()).toBe(true);
      expect(result.value?.active).toBe(true);
      expect(typeof result.value?.active).toBe('boolean');
    });
  });

  describe('isArray<string>().uniq().join() — input: string[], output: string', () => {
    it('should accept array input and produce string output', () => {
      const schema = enforce.shape({
        tags: enforce.isArray<string>().uniq().join('|'),
      });
      const suite = create(data => {
        test('tags', () => {
          enforce(data.tags).isNotEmpty();
        });
      }, schema);

      const result = suite.run({ tags: ['a', 'b', 'a'] });
      expect(result.isValid()).toBe(true);
      expect(result.value?.tags).toBe('a|b');
      expect(typeof result.value?.tags).toBe('string');
    });
  });

  describe('isNumeric().toNumber().clamp() — multi-step parser chain', () => {
    it('should accept string input through multi-step chain', () => {
      const schema = enforce.shape({
        score: enforce.isNumeric().toNumber().clamp(0, 100),
      });
      const suite = create(data => {
        test('score', () => {
          enforce(data.score).greaterThanOrEquals(0);
        });
      }, schema);

      // String '150' accepted by isNumeric, converted to 150, clamped to 100
      const result = suite.run({ score: '150' });
      expect(result.isValid()).toBe(true);
      expect(result.value?.score).toBe(100);
    });

    it('should accept number input through multi-step chain', () => {
      const schema = enforce.shape({
        score: enforce.isNumeric().toNumber().clamp(0, 100),
      });
      const suite = create(data => {
        test('score', () => {
          enforce(data.score).greaterThanOrEquals(0);
        });
      }, schema);

      const result = suite.run({ score: -5 });
      expect(result.isValid()).toBe(true);
      expect(result.value?.score).toBe(0);
    });
  });

  describe('Mixed schema with parser and non-parser fields', () => {
    it('should correctly type each field independently', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumeric().toNumber(),
        active: enforce.isString().toBoolean(),
        tags: enforce.isArray<string>().uniq().join(','),
      });

      const suite = create(data => {
        test('name', () => {
          enforce(data.name).isNotBlank();
        });
      }, schema);

      // Each field uses its own input type:
      // name: string (no coercion)
      // age: string | number (isNumeric accepts both)
      // active: string (isString)
      // tags: string[] (isArray<string>)
      const result = suite.run({
        name: 'Bob',
        age: '30',
        active: 'true',
        tags: ['x', 'y', 'x'],
      });

      expect(result.isValid()).toBe(true);
      expect(result.value).toEqual({
        name: 'Bob',
        age: 30,
        active: true,
        tags: 'x,y',
      });
    });

    it('should still reject genuinely invalid input types', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      const suite = create(() => {}, schema);

      // isNumber (not isNumeric) — input IS number, string is invalid
      // @ts-expect-error - isNumber() does not accept string input
      const result = suite.run({ name: 'Bob', age: '30' });
      expect(result.hasErrors('age')).toBe(true);
    });
  });

  describe('result.types carries schema type information', () => {
    it('should have types defined when schema is used', () => {
      const schema = enforce.shape({
        value: enforce.isNumeric().toNumber(),
      });
      const suite = create(data => {
        test('value', () => {
          enforce(data.value).isNumber();
        });
      }, schema);

      const result = suite.run({ value: '99' });

      // types is defined (not undefined) when schema is present
      expect(result.types).toBeDefined();
      expect(result.types?.output).toEqual({ value: 99 });
      // types.input also holds the parsed data at runtime
      expect(result.types?.input).toEqual({ value: 99 });
    });

    it('should have matching input and output when no parsers are used', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        count: enforce.isNumber(),
      });
      const suite = create(data => {
        test('name', () => {
          enforce(data.name).isNotBlank();
        });
      }, schema);

      const result = suite.run({ name: 'test', count: 5 });

      expect(result.types?.input).toEqual({ name: 'test', count: 5 });
      expect(result.types?.output).toEqual({ name: 'test', count: 5 });
    });
  });

  describe('Focused runs with parser schemas', () => {
    it('should accept partial input matching the focused field types', () => {
      const schema = enforce.shape({
        username: enforce.isString().trim().toLower(),
        score: enforce.isNumeric().toNumber(),
      });

      const suite = create(data => {
        test('score', () => {
          enforce(data.score).isNumber();
        });
        test('username', () => {
          enforce(data.username).isNotBlank();
        });
      }, schema);

      // Focus on score — passing string '88' is valid because isNumeric accepts string | number
      const result = suite.focus({ only: 'score' }).run({ score: '88' });
      expect(result.hasErrors('score')).toBe(false);
    });

    it('should isolate parsed values across focused runs', () => {
      const schema = enforce.shape({
        a: enforce.isString().trim(),
        b: enforce.isNumeric().toNumber(),
      });

      const suite = create(data => {
        test('a', () => {
          enforce(data.a).isNotBlank();
        });
        test('b', () => {
          enforce(data.b).isNumber();
        });
      }, schema);

      const r1 = suite.focus({ only: 'a' }).run({ a: '  x  ' });
      expect(r1.run.data.parsed).toEqual({ a: 'x' });

      const r2 = suite.focus({ only: 'b' }).run({ b: '7' });
      expect(r2.run.data.parsed).toEqual({ b: 7 });
    });
  });

  describe('n4s RuleInstance type-level contract', () => {
    it('should expose correct input and output on ~standard.types', () => {
      const rule = enforce.isNumeric().toNumber();
      const types = rule['~standard'].types;

      // The types property should exist (not optional)
      expect(types).toBeDefined();
      expect(types).toHaveProperty('input');
      expect(types).toHaveProperty('output');
    });

    it('should distinguish input from output in shape schemas', () => {
      const schema = enforce.shape({
        x: enforce.isNumeric().toNumber(),
      });
      const types = schema['~standard'].types;
      expect(types).toBeDefined();
    });

    it('should produce correct parsed value from parse()', () => {
      const rule = enforce.isNumeric().toNumber();
      expect(rule.parse('42')).toBe(42);
      expect(rule.parse(42)).toBe(42);
    });

    it('should accept input type in test()', () => {
      const rule = enforce.isNumeric().toNumber();
      expect(rule.test('100')).toBe(true);
      expect(rule.test(100)).toBe(true);
    });

    it('should produce correct shape parse with coercion', () => {
      const schema = enforce.shape({
        name: enforce.isString().trim().toUpper(),
        score: enforce.isNumeric().toNumber(),
      });

      const parsed = schema.parse({ name: '  hello  ', score: '7' });
      expect(parsed).toEqual({ name: 'HELLO', score: 7 });
    });
  });
});
