import { describe, expect, it, expectTypeOf } from 'vitest';

import { create, test } from '../../vest';

// Mocking n4s types and functions for testing Vest's inference
type RuleInstance<_T> = {
  test: (_value: any) => boolean;
  run: (_value: any) => any;
};

const enforce = {
  isString: () =>
    ({
      test: (v: any) => typeof v === 'string',
      run: () => {},
    }) as RuleInstance<string>,
  isNumber: () =>
    ({
      test: (v: any) => typeof v === 'number',
      run: () => {},
    }) as RuleInstance<number>,
  isNotEmpty: () => ({ test: (v: any) => !!v }),
  greaterThan: (n: number) => ({ test: (v: any) => v > n }),
};

// Helper to create a schema with a specific inferred type
function mockSchema<T>(inferredType: T) {
  return {
    infer: inferredType,
  };
}

type AssertTrue<T extends true> = T;
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

describe('schema driven suite types', () => {
  it('infers data type from schema', () => {
    const schema = mockSchema({} as { name: string; age: number });

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
        { name: string; age: number }
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
    const schema = mockSchema({} as { name: string; number: number });

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
    const looseSchema = mockSchema(
      {} as { title: string } & Record<string, unknown>,
    );

    const partialSchema = mockSchema(
      {} as {
        id?: number | undefined;
        label?: string | undefined;
      },
    );

    const looseSuite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<
          typeof data,
          Simplify<{ title: string } & Record<string, unknown>>
        >
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
        ReturnType<typeof looseSuite.get>['types'],
        Simplify<{ title: string } & Record<string, unknown>>
      >
    >);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof partialSuite.get>['types'],
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

  it('infers data type from generic', () => {
    const suite = create<{ name: string; age: number }>(data => {
      expectTypeOf(data).toEqualTypeOf<{ name: string; age: number }>();
    });

    expectTypeOf<Parameters<typeof suite.run>[0]>().toEqualTypeOf<{
      name: string;
      age: number;
    }>();

    suite.run({ name: 'john', age: 42 });

    expectTypeOf(suite.get().types).toBeUndefined();

    // @ts-expect-error - requires an argument
    suite.run();

    // @ts-expect-error - empty object does not satisfy type
    suite.run({});

    // @ts-expect-error - missing age should fail type-check
    suite.run({ name: 'jane' });

    // @ts-expect-error - wrong property types should fail
    suite.run({ name: '100', age: 'true' });
  });
});

describe('Schema Type Safety', () => {
  it('should allow valid data that matches schema', () => {
    const schema = mockSchema({} as { username: string; age: number });

    const suite = create(data => {
      test('username', () => {
        enforce.isString().test(data.username);
      });
      test('age', () => {
        enforce.isNumber().test(data.age);
      });
    }, schema);

    // This should compile and work
    const result = suite.run({ username: 'john', age: 30 });
    expect(result.hasErrors()).toBe(false);
  });

  it('callback parameter has correct type inference', () => {
    const schema = mockSchema({} as { email: string; count: number });

    const suite = create(data => {
      // TypeScript knows data.email is a string
      expect(data.email.length).toBeGreaterThan(0);

      // TypeScript knows data.count is a number
      expect(data.count).toBeGreaterThan(0);

      test('email', () => {
        enforce.isString().test(data.email);
      });

      test('count', () => {
        enforce.isNumber().test(data.count);
      });
    }, schema);

    const result = suite.run({ email: 'test@example.com', count: 5 });
    expect(result.hasErrors()).toBe(false);
  });

  it('nested schema properties are properly typed', () => {
    const schema = mockSchema(
      {} as {
        name: string;
        address: { street: string; city: string; zipCode: string };
      },
    );

    const suite = create(data => {
      // TypeScript knows data.address.city is a string
      expect(data.address.city.length).toBeGreaterThan(0);

      test('city', () => {
        enforce.isString().test(data.address.city);
      });
    }, schema);

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
    const schema = mockSchema(
      {} as { id: number; name: string } & Record<string, unknown>,
    );

    const suite = create(data => {
      // TypeScript knows about id and name
      expect(data.id).toBeGreaterThan(0);
      expect(data.name.length).toBeGreaterThan(0);

      test('id', () => {
        enforce.isNumber().test(data.id);
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
    const schema = mockSchema({} as { name: string; number: number });
    const suite = create(data => {
      test('name', () => {
        return enforce.isString().test(data.name);
      });
      test('number', () => {
        return enforce.isNumber().test(data.number);
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

  it('should expose schema in suite result', () => {
    const schema = mockSchema({} as { name: string });
    const suite = create(() => {}, schema);
    const result = suite.run({ name: 'Test' });
    expect(result.types).toBeDefined();
  });
});
