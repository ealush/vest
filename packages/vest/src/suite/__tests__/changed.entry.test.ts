import { expect, it } from 'vitest';

import * as relationships from '../../exports/relationships';
import {
  EnforceSchemaError,
  resolveAffected,
} from '../../exports/relationships';
import { create, enforce, test } from '../../vest';

it('exposes the n4s relationship helpers to Vest consumers', () => {
  expect(relationships).not.toHaveProperty('validateRelationshipFields');
  expect(relationships).not.toHaveProperty('FIELD');

  const schema = enforce.shape({
    root: enforce.isString(),
    mirror: enforce.isString().dependsOn($ => $('root')),
  });
  expect(resolveAffected(schema, ['root'], {})).toEqual([['root'], ['mirror']]);
  expect(() =>
    create(
      () => {},
      enforce.shape({ a: enforce.isString() }).dependsOn($ => $('a')),
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
  }
});

it('reports an unknown reference when the suite is created', () => {
  let validated = 0;
  const schema = enforce.shape({
    password: enforce.condition(() => {
      validated++;
      return true;
    }),
    // @ts-expect-error the shape also reports the typo at compile time
    confirm: enforce.isString().dependsOn($ => $('pasword')),
  });
  expect(() => create(() => {}, schema)).toThrow(EnforceSchemaError);
  expect(() => create(() => {}, schema)).toThrow(
    '"confirm" depends on unknown field "pasword". Did you mean "password"?',
  );
  // Resolving the graph runs no validation rule.
  expect(validated).toBe(0);
});

it('reports a root declaration when the suite is created', () => {
  expect(() =>
    create(
      () => {},
      enforce.shape({ a: enforce.isString() }).dependsOn($ => $('a')),
    ),
  ).toThrow(/root schema cannot depend on "a"/);
});

it('creates suites without a schema or with a foreign schema as before', () => {
  expect(() => create(() => {})).not.toThrow();
  expect(() =>
    create(() => {}, { run: () => ({ pass: true }) } as never),
  ).not.toThrow();
});
