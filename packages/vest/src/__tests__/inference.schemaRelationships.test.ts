/**
 * Vest suite inference for Schema Relationships
 * Ensures suite with schema infers data shape and that describe() is available
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';

import { create, test, enforce } from '../vest';

function typeChecks() {
  const schema = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn($ => $.password),
    profile: enforce.shape({
      age: enforce.isNumber(),
      displayName: enforce.isString().dependsOn($ => $.age),
    }),
  });

  // Suite should infer data from schema
  const suite = create(data => {
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

  // data should be { password: string, confirmPassword: string, profile: { age: number, displayName: string } }
  // The following should be valid
  suite.run({ password: 'a', confirmPassword: 'a', profile: { age: 1, displayName: 'x' } });

  // @ts-expect-error - missing required field
  suite.run({ password: 'a', confirmPassword: 'a' });

  // changed() should accept field names from schema
  suite.changed('password').run({ password: 'a', confirmPassword: 'a', profile: { age: 1, displayName: 'x' } });
  suite.changed('profile.displayName').run({ password: 'a', confirmPassword: 'a', profile: { age: 1, displayName: 'x' } });

  // @ts-expect-error - unknown field not in schema should still be allowed as string, but we test inference
  // suite.changed('unknownField')

  // describe should be on schema
  const d = schema.describe();
  const deps: typeof d.dependencies = d.dependencies;
}

describe('inference vest schemaRelationships', () => {
  it('suite with schema infers without any', () => {
    expect(true).toBe(true);
  });
});
