import { describe, expect, it, expectTypeOf } from 'vitest';

import {
  create,
  test,
  enforce,
  only,
  skip,
  include,
  optional,
} from '../../vest';

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
    const schema = enforce.shape({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });

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

    expectTypeOf(
      suite.run({ name: 'jane', age: 30 }).run.data.raw,
    ).toEqualTypeOf<unknown>();

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof suite.get>['types']['output'],
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
        ReturnType<typeof looseSuite.get>['types']['output'],
        Simplify<{ title: string } & Record<string, unknown>>
      >
    >);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof partialSuite.get>['types']['output'],
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

    expectTypeOf(suite.run(10, true).run.data.raw).toEqualTypeOf<unknown>();

    void (0 as unknown as AssertTrue<
      IsEqual<ReturnType<typeof suite.get>['types'], undefined>
    >);
    expect(suite.get().types).toBeUndefined();
  });

  it('infers data type from generic', () => {
    const suite = create((data: { name: string; age: number }) => {
      expectTypeOf(data).toEqualTypeOf<{ name: string; age: number }>();
    });

    expectTypeOf<Parameters<typeof suite.run>[0]>().toEqualTypeOf<{
      name: string;
      age: number;
    }>();

    suite.run({ name: 'john', age: 42 });

    expectTypeOf(
      suite.run({ name: 'john', age: 42 }).run.data.raw,
    ).toEqualTypeOf<unknown>();

    expectTypeOf(suite.get().types).toBeUndefined();

    // @ts-expect-error - requires an argument
    suite.run();

    // @ts-expect-error - empty object does not satisfy type
    suite.run({});

    // @ts-expect-error - missing age should fail type-check
    suite.run({ name: 'jane' });

    // @ts-expect-error - wrong property types should fail
    suite.run({ name: '100', age: 'true' });
    expect(suite.get()).toBeDefined();
  });
});

describe('schema inferred suite typing coverage', () => {
  it('infers schema keys for typed field APIs on the happy path', () => {
    const accountSchema = enforce.shape({
      username: enforce.isString(),
      age: enforce.isNumber(),
      profile: enforce.shape({
        bio: enforce.isString(),
      }),
    });

    const suite = create(data => {
      test('username', () => {
        enforce(data.username).isNotBlank();
      });
      test('age', () => {
        enforce(data.age).greaterThan(17);
      });
      test('profile', () => {
        enforce(data.profile.bio).isString();
      });
    }, accountSchema);

    suite.remove('username');
    suite.resetField('age');
    suite.afterField('profile', () => {
      const result = suite.get();
      result.hasErrors('profile');
      result.getErrors('profile');
    });

    suite.focus({ only: 'username' }).run({
      username: 'john',
      age: 20,
      profile: { bio: 'hello' },
    });

    suite.only(['username', 'age']).run({
      username: 'john',
      age: 20,
      profile: { bio: 'hello' },
    });

    const result = suite.run({
      username: 'john',
      age: 20,
      profile: { bio: 'hello' },
    });

    result.hasErrors('username');
    result.hasErrors('age');
    result.hasErrors('profile');

    const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;
    const assertOptionalField = <
      K extends Parameters<typeof suite.optional>[0],
    >(
      field: K,
    ) => field;
    const assertIncludeField = <K extends Parameters<typeof suite.include>[0]>(
      field: K,
    ) => field;

    assertTestField('username');
    assertOptionalField('age');
    assertIncludeField('profile');

    // @ts-expect-error - schema-inferred fields should reject unknown keys
    assertTestField('email');

    // @ts-expect-error - schema-inferred fields should reject unknown keys
    assertOptionalField('email');

    // @ts-expect-error - schema-inferred fields should reject unknown keys
    assertIncludeField('email');

    // @ts-expect-error - schema-inferred run requires full typed payload
    suite.run({ username: 'john' });
  });

  it('rejects passing a schema to config-only generic overload', () => {
    const schema = enforce.shape({
      username: enforce.isString(),
    });

    // @ts-expect-error - config generic overload is schema-less by design
    void create<{ fields: 'username'; groups: 'auth' }>(() => {}, schema);
  });
  it('keeps group modifiers open when groups are not explicitly typed', () => {
    const schema = enforce.shape({
      username: enforce.isString(),
    });

    const suite = create(data => {
      test('username', () => {
        enforce(data.username).isNotBlank();
      });
    }, schema);

    suite.focus({ onlyGroup: 'auth', skipGroup: ['admin', 'internal'] }).run({
      username: 'john',
    });
  });
});

describe('escape hatch and config overload typing', () => {
  it('supports create<null>() as an explicit untyped escape hatch', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      count: enforce.isNumber(),
    });

    const suite = create<null>((data: any) => {
      void data.anything;
    });

    const suiteWithSchema = create<null>((data: any) => {
      void data.whatever;
    }, schema);

    const assertEscapeField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;

    assertEscapeField('dynamic_field');
    suite.focus({ onlyGroup: 'dynamic_group', skipGroup: ['another_group'] });

    suiteWithSchema.run({ anything: 'goes' });
    suiteWithSchema.get().hasErrors('any_field_name');

    expectTypeOf<
      Parameters<typeof suiteWithSchema.run>[0]
    >().toEqualTypeOf<any>();
  });

  it('supports explicit SuiteConfig generic typing for fields/groups', () => {
    const suite = create<{ fields: 'id' | 'role'; groups: 'auth' | 'admin' }>(
      (_data: unknown) => {},
    );

    const assertField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;

    assertField('id');
    assertField('role');

    // @ts-expect-error - invalid field should fail for config overload
    assertField('email');

    const assertGroup = <
      K extends Exclude<Parameters<typeof suite.group>[0], () => void>,
    >(
      groupName: K,
    ) => groupName;

    assertGroup('auth');

    // @ts-expect-error - invalid group should fail for config overload
    assertGroup('payments');

    suite.remove('id');
    suite.focus({ only: 'role', onlyGroup: 'admin' });
    suite.get().hasErrors('role');
  });
});

describe('Schema Type Safety', () => {
  it('should allow valid data that matches schema', () => {
    const schema = enforce.shape({
      username: enforce.isString(),
      age: enforce.isNumber(),
    });

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
    const schema = enforce.shape({
      name: enforce.isString(),
      address: enforce.shape({
        street: enforce.isString(),
        city: enforce.isString(),
        zipCode: enforce.isString(),
      }),
    });

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
    const schema = enforce.loose({
      id: enforce.isNumber(),
      name: enforce.isString(),
    });

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
    const schema = enforce.shape({
      name: enforce.isString(),
      number: enforce.isNumber(),
    });
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
    const schema = enforce.shape({
      name: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    const result = suite.run({ name: 'Test' });
    expect(result.types).toBeDefined();
  });
});

describe('callback-level only() typing', () => {
  it('types suite.only() with config-based fields', () => {
    const suite = create<{ fields: 'a' | 'b'; groups: 'g1' }>(
      (_data: unknown) => {
        // Top-level only() inside callback compiles (untyped)
        only('a');
        only(['a', 'b']);
      },
    );

    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;

    assertSkipField('a');

    // @ts-expect-error - invalid field should fail on suite.skip
    assertSkipField('invalid');
  });

  it('types suite.only() with schema-inferred fields', () => {
    const schema = enforce.shape({
      username: enforce.isString(),
      age: enforce.isNumber(),
    });

    const suite = create(data => {
      // Top-level only() inside callback compiles (untyped)
      only('username');
      only(['username', 'age']);

      test('username', () => {
        enforce(data.username).isNotBlank();
      });
    }, schema);

    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;

    assertSkipField('username');

    // @ts-expect-error - invalid field should fail on suite.skip
    assertSkipField('email');
  });

  it('allows any string for only() in untyped fallback', () => {
    const suite = create((_data: any) => {
      only('anything');
      only(['x', 'y', 'z']);
    });

    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;

    assertSkipField('anything');
  });

  it('allows any string for only() with escape hatch', () => {
    const suite = create<null>((_data: any) => {
      only('dynamic');
      only(['a', 'b']);
    });

    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;

    assertSkipField('dynamic');
  });
});

describe('comprehensive typed API coverage', () => {
  it('config-based: all APIs accept typed fields and reject invalid ones', () => {
    const suite = create<{ fields: 'a' | 'b'; groups: 'g1' }>(
      (_data: unknown) => {
        // Top-level functions inside callback are untyped — always compile
        test('a', () => {});
        only('a');
        skip('b');
        include('a').when('b');
        optional('a');
      },
    );

    // Suite-level APIs — positive cases (no runtime context needed)
    suite.remove('a');
    suite.resetField('a');
    suite.afterField('a', () => {});

    // Suite-bound APIs reject invalid fields
    // @ts-expect-error - invalid field for suite.remove
    suite.remove('invalid');

    // @ts-expect-error - invalid field for suite.resetField
    suite.resetField('invalid');

    // @ts-expect-error - invalid field for suite.afterField
    suite.afterField('invalid', () => {});

    // @ts-expect-error - invalid field for suite.focus only
    suite.focus({ only: 'invalid' });

    // Type-level assertions for suite typed methods
    const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;
    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;
    const assertIncludeField = <K extends Parameters<typeof suite.include>[0]>(
      field: K,
    ) => field;
    const assertOptionalField = <
      K extends Parameters<typeof suite.optional>[0],
    >(
      field: K,
    ) => field;
    const assertGroupName = <
      K extends Exclude<Parameters<typeof suite.group>[0], () => void>,
    >(
      group: K,
    ) => group;

    assertTestField('a');
    assertSkipField('b');
    assertIncludeField('a');
    assertOptionalField('a');
    assertGroupName('g1');

    // @ts-expect-error - invalid field for suite.test
    assertTestField('invalid');

    // @ts-expect-error - invalid field for suite.skip
    assertSkipField('invalid');

    // @ts-expect-error - invalid field for suite.include
    assertIncludeField('invalid');

    // @ts-expect-error - invalid field for suite.optional
    assertOptionalField('invalid');

    // @ts-expect-error - invalid group for suite.group
    assertGroupName('invalid');

    // Result selectors reject invalid fields
    const result = suite.get();
    result.hasErrors('a');
    result.getErrors('a');

    // @ts-expect-error - invalid field for result.hasErrors
    result.hasErrors('invalid');

    // @ts-expect-error - invalid field for result.getErrors
    result.getErrors('invalid');

    // @ts-expect-error - invalid group for focus
    suite.focus({ onlyGroup: 'invalid' });
  });

  it('schema-inferred: all APIs accept schema fields and reject invalid ones', () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      count: enforce.isNumber(),
    });

    const suite = create(data => {
      // Top-level functions inside callback are untyped — always compile
      test('email', () => {
        enforce(data.email).isNotBlank();
      });
      only('email');
      skip('count');
      include('email').when('count');
      optional('email');
    }, schema);

    // Suite-level APIs — positive cases (no runtime context needed)
    suite.remove('email');
    suite.resetField('count');
    suite.afterField('email', () => {});

    // Suite-bound APIs reject unknown fields
    // @ts-expect-error - unknown field for suite.remove
    suite.remove('unknown');

    // @ts-expect-error - unknown field for suite.resetField
    suite.resetField('unknown');

    // @ts-expect-error - unknown field for suite.afterField
    suite.afterField('unknown', () => {});

    // @ts-expect-error - unknown field for suite.focus only
    suite.focus({ only: 'unknown' });

    // Type-level assertions for suite typed methods
    const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;
    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;
    const assertIncludeField = <K extends Parameters<typeof suite.include>[0]>(
      field: K,
    ) => field;
    const assertOptionalField = <
      K extends Parameters<typeof suite.optional>[0],
    >(
      field: K,
    ) => field;

    assertTestField('email');
    assertSkipField('count');
    assertIncludeField('email');
    assertOptionalField('count');

    // @ts-expect-error - unknown field for suite.test
    assertTestField('unknown');

    // @ts-expect-error - unknown field for suite.skip
    assertSkipField('unknown');

    // @ts-expect-error - unknown field for suite.include
    assertIncludeField('unknown');

    // @ts-expect-error - unknown field for suite.optional
    assertOptionalField('unknown');

    // Result selectors reject unknown fields
    const result = suite.get();
    result.hasErrors('email');
    result.getErrors('count');

    // @ts-expect-error - unknown field for result.hasErrors
    result.hasErrors('unknown');

    // @ts-expect-error - unknown field for result.getErrors
    result.getErrors('unknown');
  });

  it('escape hatch: all APIs accept any string', () => {
    const suite = create<null>((_data: any) => {
      test('anything', () => {});
      only('anything');
      skip('anything');
      include('anything').when('other');
      optional('anything');
    });

    suite.remove('anything');
    suite.resetField('anything');
    suite.focus({ only: 'anything' });
    suite.afterField('anything', () => {});

    // Type-level assertions — all accept any string
    const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;
    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;
    const assertIncludeField = <K extends Parameters<typeof suite.include>[0]>(
      field: K,
    ) => field;
    const assertOptionalField = <
      K extends Parameters<typeof suite.optional>[0],
    >(
      field: K,
    ) => field;

    assertTestField('anything');
    assertSkipField('anything');
    assertIncludeField('anything');
    assertOptionalField('anything');

    const result = suite.get();
    result.hasErrors('anything');
    result.getErrors('anything');
  });

  it('untyped fallback: all APIs accept any string', () => {
    const suite = create((_data: any) => {
      test('anything', () => {});
      only('anything');
      skip('anything');
      include('anything').when('other');
      optional('anything');
    });

    suite.remove('anything');
    suite.resetField('anything');
    suite.focus({ only: 'anything' });
    suite.afterField('anything', () => {});

    // Type-level assertions — all accept any string
    const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;
    const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
      field: K,
    ) => field;
    const assertIncludeField = <K extends Parameters<typeof suite.include>[0]>(
      field: K,
    ) => field;
    const assertOptionalField = <
      K extends Parameters<typeof suite.optional>[0],
    >(
      field: K,
    ) => field;

    assertTestField('anything');
    assertSkipField('anything');
    assertIncludeField('anything');
    assertOptionalField('anything');

    const result = suite.get();
    result.hasErrors('anything');
    result.getErrors('anything');
  });
});

describe('lazy schema in suite types', () => {
  it('infers data type from schema containing lazy fields', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      metadata: enforce.lazy(() =>
        enforce.shape({
          key: enforce.isString(),
          value: enforce.isNumber(),
        }),
      ),
    });

    const suite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<
          typeof data,
          { name: string; metadata: { key: string; value: number } }
        >
      >);
      void (0 as unknown as AssertTrue<IsEqual<(typeof data)['name'], string>>);
      void (0 as unknown as AssertTrue<
        IsEqual<(typeof data)['metadata'], { key: string; value: number }>
      >);
    }, schema);

    void (0 as unknown as AssertTrue<
      IsEqual<
        Parameters<typeof suite.run>[0],
        { name: string; metadata: { key: string; value: number } }
      >
    >);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof suite.get>['types']['output'],
        { name: string; metadata: { key: string; value: number } }
      >
    >);

    suite.run({ name: 'test', metadata: { key: 'k', value: 1 } });

    // @ts-expect-error - metadata.value must be number
    suite.run({ name: 'test', metadata: { key: 'k', value: 'bad' } });

    // @ts-expect-error - missing metadata field
    suite.run({ name: 'test' });
  });
});
