import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

function createSchemaSuite() {
  return create(
    data => {
      test('a', () => {
        enforce(data?.a).isString();
      });
      test('b', () => {
        enforce(data?.b).isString();
      });
    },
    enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
  );
}

describe('pathless schema failures during focused validation', () => {
  it.each(['a', 'b'] as const)(
    'reports a root failure on a fresh run focused on %s',
    field => {
      const result = createSchemaSuite()
        .only(field)
        .run(null as never);

      expect(result.getErrors()).toHaveProperty('__root__');
      expect(result.hasErrors(field)).toBe(true);
      expect(result.hasErrors(field === 'a' ? 'b' : 'a')).toBe(false);
    },
  );

  it('reports a root failure with combined field modifiers', () => {
    const result = createSchemaSuite()
      .focus({ only: 'a', skip: 'b' })
      .run(null as never);

    expect(result.getErrors()).toHaveProperty('__root__');
    expect(result.hasErrors('a')).toBe(true);
    expect(result.hasErrors('b')).toBe(false);
  });

  it('keeps field skip behavior while reporting the root failure', () => {
    const result = createSchemaSuite()
      .focus({ skip: 'b' })
      .run(null as never);

    expect(result.getErrors()).toHaveProperty('__root__');
    expect(result.hasErrors('a')).toBe(true);
    expect(result.hasErrors('b')).toBe(false);
  });

  it('still focuses a user test named __root__', () => {
    const suite = create(
      () => {
        test('a', () => true);
        test('__root__', () => false);
      },
      enforce.shape({ a: enforce.isString() }),
    );

    expect(suite.only('a').run({ a: 'ok' }).getErrors()).not.toHaveProperty(
      '__root__',
    );
    expect(suite.run({ a: 'ok' }).getErrors()).toHaveProperty('__root__');
  });

  it('still focuses a literal schema key named __root__', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({ a: enforce.isString(), __root__: enforce.isString() }),
    );
    const data = { a: 'ok', __root__: 1 } as never;

    expect(suite.only('a').run(data).getErrors()).not.toHaveProperty(
      '__root__',
    );
    expect(suite.run(data).getErrors()).toHaveProperty('__root__');
  });

  it('clears the root failure when the focused schema accepts the input', () => {
    const suite = createSchemaSuite();
    expect(suite.run(null as never).getErrors()).toHaveProperty('__root__');

    const result = suite.only('a').run({ a: 'ok', b: 'ok' });
    expect(result.getErrors()).not.toHaveProperty('__root__');
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('b')).toBe(true);
  });
});
