import { expect, it } from 'vitest';

import * as relationships from '../../exports/relationships';
import {
  EnforceSchemaError,
  FIELD,
  resolveAffected,
} from '../../exports/relationships';
import { create, enforce, test } from '../../vest';

it('exposes the n4s relationship helpers to Vest consumers', () => {
  expect(typeof FIELD).toBe('symbol');
  expect(relationships).not.toHaveProperty('validateRelationshipFields');

  const schema = enforce.shape({
    root: enforce.isString(),
    mirror: enforce.isString().dependsOn($ => $[FIELD]('root')),
  });
  expect(resolveAffected(schema, ['root'], {})).toEqual([['root'], ['mirror']]);
  expect(() =>
    create(
      () => {},
      enforce.shape({ a: enforce.isString() }).dependsOn($ => $.a),
    )
      .changed('a')
      .run({ a: 'x' }),
  ).toThrow(EnforceSchemaError);
});

it('reports a root schema failure from a changed fallback run under the root name', () => {
  for (const path of [[], undefined]) {
    const suite = create(() => test('a', () => true), {
      run: () => ({ pass: false, path, message: 'root failed' }),
    });
    const result = suite.changed('a').run({ a: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors.map(error => error.fieldName)).toEqual(['__root__']);
    expect(result.issues).toEqual([
      { message: 'root failed', path: undefined },
    ]);
    expect(suite['~standard'].validate({ a: 1 })).toEqual({
      issues: result.issues,
    });
  }
});
