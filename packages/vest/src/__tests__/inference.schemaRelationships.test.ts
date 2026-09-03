/**
 * Vest suite inference for Schema Relationships
 * Ensures suite with schema infers data shape and that describe() is available
 */

/* eslint-disable vitest/valid-expect, vitest/no-commented-out-tests */
import { describe, it, expect, expectTypeOf } from 'vitest';

import { create, test, enforce } from '../vest';

function typeChecks() {
  const schema = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn($ => {
      // scope should be inferred without explicit annotation
      expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
      expectTypeOf($.password).toMatchTypeOf<unknown>();
      expectTypeOf($.root).toMatchTypeOf<unknown>();
      return $.password;
    }),
    profile: enforce.shape({
      age: enforce.isNumber(),
      displayName: enforce.isString().dependsOn($ => {
        expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
        return $.age;
      }),
    }),
  });

  // inferred data shape - schema.infer
  expectTypeOf(schema.infer).toEqualTypeOf<{
    password: string;
    confirmPassword: string;
    profile: { age: number; displayName: string };
  }>();

  // describe() output shape
  expectTypeOf(schema.describe).returns.toEqualTypeOf<{
    dependencies: Array<{ target: unknown; sources: unknown[] }>;
    relationships: unknown[];
  }>();

  // Suite should infer data from schema
  const suite = create(data => {
    // inferred data shape inside suite callback
    expectTypeOf(data).toEqualTypeOf<{
      password: string;
      confirmPassword: string;
      profile: { age: number; displayName: string };
    }>();
    expectTypeOf(data.password).toEqualTypeOf<string>();
    expectTypeOf(data.confirmPassword).toEqualTypeOf<string>();
    expectTypeOf(data.profile).toEqualTypeOf<{
      age: number;
      displayName: string;
    }>();
    expectTypeOf(data.profile.age).toEqualTypeOf<number>();
    expectTypeOf(data.profile.displayName).toEqualTypeOf<string>();
    test('password', () => {
      enforce(data.password).isString();
    });
    test('confirmPassword', () => {
      enforce(data.confirmPassword).isString();
    });
    test('profile.displayName', () => {
      enforce(data.profile.displayName).isString();
    });
  }, schema);

  // inferred data shape - suite.run parameter
  expectTypeOf(suite.run).parameter(0).toEqualTypeOf<{
    password: string;
    confirmPassword: string;
    profile: { age: number; displayName: string };
  }>();
  expectTypeOf(suite.get).returns.toMatchTypeOf<{
    hasErrors: unknown;
  }>();

  // data should be { password: string, confirmPassword: string, profile: { age: number, displayName: string } }
  // The following should be valid
  suite.run({
    password: 'a',
    confirmPassword: 'a',
    profile: { age: 1, displayName: 'x' },
  });

  // @ts-expect-error - missing required field
  suite.run({ password: 'a', confirmPassword: 'a' });

  // changed() should accept field names from schema - dependency fields
  expectTypeOf(suite.changed).toBeFunction();
  // string acceptance is proven by the value-level changed() calls below
  // valid dependency field should be accepted
  suite.changed('password').run({
    password: 'a',
    confirmPassword: 'a',
    profile: { age: 1, displayName: 'x' },
  });
  suite.changed('profile.displayName').run({
    password: 'a',
    confirmPassword: 'a',
    profile: { age: 1, displayName: 'x' },
  });
  // also test changed with array of fields
  suite.changed(['password', 'profile.displayName']).run({
    password: 'a',
    confirmPassword: 'a',
    profile: { age: 1, displayName: 'x' },
  });

  // describe should be on schema - describe() output
  const d = schema.describe();
  expectTypeOf(d).toEqualTypeOf<ReturnType<typeof schema.describe>>();
  expectTypeOf(d.dependencies).toEqualTypeOf<
    Array<{ target: unknown; sources: unknown[] }>
  >();
  expectTypeOf(d.relationships).toEqualTypeOf<unknown[]>();
  expectTypeOf(d.dependencies).toBeArray();
  expectTypeOf(d.relationships).toBeArray();
  const deps: typeof d.dependencies = d.dependencies;
  void deps;
}

// typeChecks is type-only — not invoked at runtime to avoid enforce.shape side effects;
// tsc --noEmit with expectTypeOf validates it statically
void typeChecks;

describe('inference vest schemaRelationships', () => {
  it('suite with schema infers without any', () => {
    expect(true).toBe(true);
  });
});
