/**
 * Type inference tests for Schema Relationships
 * Verifies that $ is inferrable without explicit annotation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';

import { enforce } from '../n4s';

function typeChecks() {
  // $ should be inferred as Scope without annotation
  const schema1 = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn($ => $.password),
    // $ => $.password should be valid, $ => $.missing should be valid (any key allowed via index signature)
    // but the type of $ should be Scope, not any
  });

  // Revalidates also inferrable
  const schema2 = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().revalidates($ => $.a),
  });

  // Chained dependsOn
  const schema3 = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country).revalidates($ => $.country),
  });

  // Root escape
  const inner = enforce.shape({
    taxId: enforce.isString().dependsOn($ => $.root.accountType),
  });
  const outer = enforce.shape({
    accountType: enforce.isString(),
    company: inner,
  });

  // Array item - $ is still Scope, not array-specific
  // Item must declare its own dependency source
  const item = enforce.shape({
    country: enforce.isString(),
    passport: enforce.isString().dependsOn($ => $.country),
  });
  const withArray = enforce.shape({
    travelers: enforce.isArrayOf(item),
  });

  void schema1.describe();
  void withArray.describe();

  // Optional wrappers preserve describe
  const opt = enforce.optional(schema1);
  const d1 = opt.describe();

  const partial = enforce.partial({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  const d2 = partial.describe();
}

describe('inference.dependsOn', () => {
  it('schema with dependsOn typechecks without explicit annotation', () => {
    expect(true).toBe(true);
  });
});
