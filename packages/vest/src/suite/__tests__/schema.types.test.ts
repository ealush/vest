import {
  enforce,
  type RuleInstance,
  type SchemaInfer,
  type ShapeType,
  type LooseShapeValue,
  type PartialShapeValue,
} from 'n4s';
import { describe, expect, it, expectTypeOf } from 'vitest';

import { create } from 'vest';

describe('schema type exports', () => {
  it('exposes RuleInstance type for schemas', () => {
    const rule = enforce.isString();

    expectTypeOf(rule).toMatchTypeOf<RuleInstance<string>>();
    expect(rule.test('value')).toBe(true);
  });

  it('infers data types from schema rule instances', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });

    expectTypeOf(schema.infer).toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it('infers data types from loose and partial schemas', () => {
    const looseSchema = enforce.loose({
      title: enforce.isString(),
    });

    const partialSchema = enforce.partial({
      id: enforce.isNumber(),
      label: enforce.isString(),
    });

    expectTypeOf(looseSchema.infer).toEqualTypeOf<
      {
        title: string;
      } & Record<string, unknown>
    >();

    expectTypeOf(partialSchema.infer).toEqualTypeOf<{
      id?: number | undefined;
      label?: string | undefined;
    }>();
  });

  it('allows importing schema helper types', () => {
    type Schema = {
      username: RuleInstance<string>;
      score: RuleInstance<number>;
    };

    type InferredViaSchemaInfer = SchemaInfer<Schema>;
    type InferredViaShapeType = ShapeType<Schema>;
    type LooseValue = LooseShapeValue<Schema>;
    type PartialValue = PartialShapeValue<Schema>;

    expectTypeOf<InferredViaSchemaInfer>().toEqualTypeOf<{
      username: string;
      score: number;
    }>();

    expectTypeOf<InferredViaShapeType>().toEqualTypeOf<{
      username: string;
      score: number;
    }>();

    expectTypeOf<LooseValue>().toEqualTypeOf<
      {
        username: string;
        score: number;
      } & Record<string, unknown>
    >();

    expectTypeOf<PartialValue>().toEqualTypeOf<{
      username?: string | undefined;
      score?: number | undefined;
    }>();
  });
});

type AssertTrue<T extends true> = T;
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;

describe.skip('schema driven suite types', () => {
  it('infers data type from enforce.shape schema', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });

    type i = typeof schema.infer;
    /* INCORRECT!
     type i = {} & {
      name?: unknown;
      age?: unknown;
    } */

    const suite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { name: string; age: number }>
      >);
      void (0 as unknown as AssertTrue<IsEqual<(typeof data)['name'], string>>);
      void (0 as unknown as AssertTrue<IsEqual<(typeof data)['age'], number>>);
    }, schema);

    void (0 as unknown as AssertTrue<
      IsEqual<Parameters<typeof suite.run>[0], { name: string; age: number }>
    >);

    suite.run({ name: 'john', age: 42 });

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof suite.get>['types'],
        { data: { name: string; age: number }; schema: typeof schema }
      >
    >);

    // @ts-expect-error - requires an argument matching the schema
    suite.run();

    // @ts-expect-error - empty object does not satisfy schema
    suite.run({});

    // @ts-expect-error - missing age should fail type-check
    suite.run({ name: 'jane' });

    // @ts-expect-error - wrong property types should fail
    suite.run({ name: 100, age: true });

    // @ts-expect-error - unexpected keys that don't satisfy schema should fail
    suite.run({ number: 'john' });
  });

  it('disallows invalid runs for custom schema', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      number: enforce.isNumber(),
    });

    const suite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { name: string; number: number }>
      >);
    }, schema);

    suite.run({ name: 'valid', number: 1 });

    // @ts-expect-error - run requires argument
    suite.run();

    // @ts-expect-error - empty object does not match schema
    suite.run({});

    // @ts-expect-error - incorrect property types
    suite.run({ name: 100 });

    // @ts-expect-error - incorrect keys should not be allowed
    suite.run({ number: 'john' });
  });

  it('infers loose and partial schemas', () => {
    const looseSchema = enforce.loose({
      title: enforce.isString(),
    });

    const partialSchema = enforce.partial({
      id: enforce.isNumber(),
      label: enforce.isString(),
    });

    const looseSuite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { title: string } & Record<string, unknown>>
      >);
    }, looseSchema);

    const partialSuite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<
          typeof data,
          { id?: number | undefined; label?: string | undefined }
        >
      >);
    }, partialSchema);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof looseSuite.get>['types']['data'],
        { title: string } & Record<string, unknown>
      >
    >);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof partialSuite.get>['types']['data'],
        { id?: number | undefined; label?: string | undefined }
      >
    >);

    looseSuite.run({ title: 'post', extra: true });
    partialSuite.run({ label: 'hello' });

    // @ts-expect-error - label must be string when present
    partialSuite.run({ label: 10 });
  });

  it('keeps backwards compatibility without schema', () => {
    const suite = create((value: number, flag: boolean) => {
      void (0 as unknown as AssertTrue<IsEqual<typeof value, number>>);
      void (0 as unknown as AssertTrue<IsEqual<typeof flag, boolean>>);
    });

    suite.run(10, true);

    void (0 as unknown as AssertTrue<
      IsEqual<ReturnType<typeof suite.get>['types'], undefined>
    >);
  });
});

describe.skip('Schema Type Safety', () => {
  it('should allow valid data that matches schema', () => {
    const schema = enforce.shape({
      username: enforce.isString(),
      age: enforce.isNumber(),
    });

    const suite = create(data => {
      test('username', () => {
        enforce(data.username).isNotEmpty();
      });
      test('age', () => {
        enforce(data.age).greaterThan(0);
      });
    }, schema);

    // This should compile and work
    const result = suite.run({ username: 'john', age: 30 });
    expect(result.hasErrors()).toBe(false);
  });

  it('callback parameter has correct type inference', () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      count: enforce.isNumber(),
    });

    const suite = create(data => {
      // TypeScript knows data.email is a string
      expect(data.email.length).toBeGreaterThan(0);

      // TypeScript knows data.count is a number
      expect(data.count).toBeGreaterThan(0);

      test('email', () => {
        enforce(data.email).isNotEmpty();
      });

      test('count', () => {
        enforce(data.count).isNumber();
      });
    }, schema);

    const result = suite.run({ email: 'test@example.com', count: 5 });
    expect(result.hasErrors()).toBe(false);
  });

  it('nested schema properties are properly typed', () => {
    const addressSchema = enforce.shape({
      street: enforce.isString(),
      city: enforce.isString(),
      zipCode: enforce.isString(),
    });

    const userSchema = enforce.shape({
      name: enforce.isString(),
      address: addressSchema,
    });

    const suite = create(data => {
      // TypeScript knows data.address.city is a string
      expect(data.address.city.length).toBeGreaterThan(0);

      test('city', () => {
        enforce(data.address.city).isNotEmpty();
      });
    }, userSchema);

    const result = suite.run({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        zipCode: '12345',
      },
    });

    expect(result.hasErrors()).toBe(false);
  });

  it('loose schema allows extra properties', () => {
    const schema = enforce.loose({
      id: enforce.isNumber(),
      name: enforce.isString(),
    });

    const suite = create(data => {
      // TypeScript knows about id and name
      expect(data.id).toBeGreaterThan(0);
      expect(data.name.length).toBeGreaterThan(0);

      test('id', () => {
        enforce(data.id).isNumber();
      });
    }, schema);

    // Extra properties are allowed with loose schema
    const result = suite.run({
      id: 1,
      name: 'Test',
      extra: 'This is fine',
      another: 42,
    });

    expect(result.hasErrors()).toBe(false);
  });

  it('suite without schema accepts any data', () => {
    const suite = create((data: any) => {
      test('test', () => {
        expect(data).toBeDefined();
      });
    });

    // Without schema, any data is accepted
    const result1 = suite.run({ anything: 'goes' });
    const result2 = suite.run([1, 2, 3]);
    const result3 = suite.run('string');
    const result4 = suite.run(42);

    expect(result1.hasErrors()).toBe(false);
    expect(result2.hasErrors()).toBe(false);
    expect(result3.hasErrors()).toBe(false);
    expect(result4.hasErrors()).toBe(false);
  });

  describe('non-compliant schema runs', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      number: enforce.isNumber(),
    });
    const suite = create(data => {
      test('name', () => {
        enforce(data.name).isString();
      });
      test('number', () => {
        enforce(data.number).isNumber();
      });
    }, schema);

    it('should fail when run() is called with no arguments', () => {
      // @ts-expect-error - run requires argument matching schema
      const result = suite.run();
      expect(result.hasErrors()).toBe(true);
    });

    it('should fail when run() is called with empty object', () => {
      // @ts-expect-error - empty object does not satisfy schema
      const result = suite.run({});
      expect(result.hasErrors()).toBe(true);
    });

    it('should fail when run() is called with incorrect object values', () => {
      // @ts-expect-error - incorrect property values violate schema
      const result = suite.run({ name: 100, number: true });
      expect(result.hasErrors()).toBe(true);
    });
  });
});
