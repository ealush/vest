/**
 * Type inference tests for Schema Relationships
 * Verifies that $ is inferrable without explicit annotation
 */

/* eslint-disable @typescript-eslint/no-unused-vars, vitest/valid-expect, vitest/no-commented-out-tests */
import { describe, it, expect, expectTypeOf } from 'vitest';

import { enforce } from '../n4s';

function typeChecks() {
  // $ should be inferred as Scope without annotation - scope inference
  const schema1 = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn($ => {
      expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
      expectTypeOf($.password).toMatchTypeOf<unknown>();
      expectTypeOf($.root).toMatchTypeOf<unknown>();
      return $.password;
    }),
    // $ => $.password should be valid, $ => $.missing should be valid (any key allowed via index signature)
    // but the type of $ should be Scope, not any
  });

  // inferred data shape - schema1
  expectTypeOf(schema1.infer).toEqualTypeOf<{
    password: string;
    confirmPassword: string;
  }>();
  expectTypeOf(schema1.describe).returns.toEqualTypeOf<{
    dependencies: Array<{ target: unknown; sources: unknown[] }>;
    relationships: unknown[];
  }>();
  // dependency fields - describe output
  const desc1 = schema1.describe();
  expectTypeOf(desc1.dependencies).toBeArray();
  expectTypeOf(desc1.relationships).toBeArray();
  expectTypeOf(desc1.dependencies[0]?.sources).toBeArray();

  // Revalidates also inferrable - scope inference
  const schema2 = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().revalidates($ => {
      expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
      return $.a;
    }),
  });
  expectTypeOf(schema2.infer).toEqualTypeOf<{ a: string; b: string }>();
  expectTypeOf(schema2.describe).returns.toMatchTypeOf<{
    dependencies: Array<{ target: unknown; sources: unknown[] }>;
    relationships: unknown[];
  }>();

  // Chained dependsOn - scope and dependency fields
  const schema3 = enforce.shape({
    country: enforce.isString(),
    state: enforce
      .isString()
      .dependsOn($ => {
        expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
        return $.country;
      })
      .revalidates($ => {
        expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
        return $.country;
      }),
  });
  expectTypeOf(schema3.infer).toEqualTypeOf<{
    country: string;
    state: string;
  }>();

  // Root escape - scope root inference
  const inner = enforce.shape({
    taxId: enforce.isString().dependsOn($ => {
      expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
      expectTypeOf($.root).toMatchTypeOf<unknown>();
      expectTypeOf($.root.accountType).toMatchTypeOf<unknown>();
      return $.root.accountType;
    }),
  });
  const outer = enforce.shape({
    accountType: enforce.isString(),
    company: inner,
  });
  expectTypeOf(inner.infer).toEqualTypeOf<{ taxId: string }>();
  expectTypeOf(outer.infer).toEqualTypeOf<{
    accountType: string;
    company: { taxId: string };
  }>();
  expectTypeOf(outer.describe).returns.toMatchTypeOf<{
    dependencies: Array<{ target: unknown; sources: unknown[] }>;
    relationships: unknown[];
  }>();

  // Array item - $ is still Scope, not array-specific - scope inference
  // Item must declare its own dependency source
  const item = enforce.shape({
    country: enforce.isString(),
    passport: enforce.isString().dependsOn($ => {
      expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
      return $.country;
    }),
  });
  const withArray = enforce.shape({
    travelers: enforce.isArrayOf(item),
  });
  expectTypeOf(item.infer).toEqualTypeOf<{
    country: string;
    passport: string;
  }>();
  expectTypeOf(withArray.infer).toEqualTypeOf<{
    travelers: Array<{ country: string; passport: string }>;
  }>();

  void schema1.describe();
  void withArray.describe();
  // describe() output for withArray
  const withArrayDesc = withArray.describe();
  expectTypeOf(withArrayDesc.dependencies).toBeArray();
  expectTypeOf(withArrayDesc.relationships).toBeArray();

  // Optional wrappers preserve describe - describe() output
  const opt = enforce.optional(schema1);
  const d1 = opt.describe();
  expectTypeOf(opt.describe).returns.toEqualTypeOf<{
    dependencies: Array<{ target: unknown; sources: unknown[] }>;
    relationships: unknown[];
  }>();
  expectTypeOf(d1.dependencies).toBeArray();
  expectTypeOf(d1.relationships).toBeArray();

  const partial = enforce.partial({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => {
      expectTypeOf($).toMatchTypeOf<{ root: unknown }>();
      return $.a;
    }),
  });
  const d2 = partial.describe();
  expectTypeOf(partial.infer).toEqualTypeOf<{
    a?: string | undefined;
    b?: string | undefined;
  }>();
  expectTypeOf(d2.dependencies).toBeArray();
  expectTypeOf(partial.describe).returns.toMatchTypeOf<{
    dependencies: Array<{ target: unknown; sources: unknown[] }>;
    relationships: unknown[];
  }>();
  void d1;
  void d2;
}

describe('inference.dependsOn', () => {
  it('schema with dependsOn typechecks without explicit annotation', () => {
    expect(true).toBe(true);
  });
});
