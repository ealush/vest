import { expect, it, vi } from 'vitest';
import { compose } from 'n4s';

import '../../exports/relationships';
import { create, enforce, test } from '../../vest';

it('validates both changed schema fields even when both fail', () => {
  const schema = enforce.shape({
    first: enforce.isString(),
    last: enforce.isString(),
    untouched: enforce.isString(),
  });
  const suite = create(() => test('first', () => true), schema);
  const result = suite.changed(['first', 'last']).run({
    first: 1,
    last: 2,
    untouched: 'ok',
  } as never);
  expect(result.hasErrors('first')).toBe(true);
  expect(result.hasErrors('last')).toBe(true);
});

it('reports a changed nested field and a second invalid top-level field', () => {
  const schema = enforce.shape({
    rows: enforce.isArrayOf(
      enforce.shape({
        c: enforce.isString(),
      }),
    ),
    last: enforce.isString(),
  });
  const suite = create(() => test('rows', () => true), schema);
  const result = suite.changed(['rows.0.c', 'last']).run({
    rows: [{ c: 1 }],
    last: 2,
  } as never);
  expect(result.errors.map(error => error.fieldName)).toContain('rows.0.c');
  expect(result.hasErrors('last')).toBe(true);
});

it('focuses a nested user test and honors a skipped ancestor', () => {
  const nested = vi.fn();
  const schema = enforce.shape({
    rows: enforce.isArrayOf(enforce.shape({ c: enforce.isString() })),
  });
  const suite = create(() => test('rows.0.c', nested), schema);
  suite.changed('rows.0.c').run({ rows: [{ c: 'ok' }] });
  expect(nested).toHaveBeenCalledOnce();
  suite
    .changed('rows.0.c')
    .focus({ skip: 'rows' })
    .run({
      rows: [{ c: 'ok' }],
    });
  expect(nested).toHaveBeenCalledOnce();
});

it('clears changed focus with changed(undefined)', () => {
  const a = vi.fn();
  const b = vi.fn();
  const suite = create(() => {
    test('a', a);
    test('b', b);
  });
  suite.changed('a').changed(undefined).run();
  expect(a).toHaveBeenCalledOnce();
  expect(b).toHaveBeenCalledOnce();
});

it('matches only() for a suite without a schema', () => {
  const a = vi.fn();
  const b = vi.fn();
  const suite = create(() => {
    test('a', a);
    test('b', b);
  });
  suite.changed('a').run();
  expect(a).toHaveBeenCalledOnce();
  expect(b).not.toHaveBeenCalled();
});

it('validates a composed root as a whole when it cannot be picked', () => {
  const schema = compose(
    enforce.shape({ source: enforce.isString() }),
    enforce.shape({
      dependent: enforce.isString().dependsOn($ => $.root.source),
    }),
  );
  const suite = create(() => test('source', () => true), schema);
  const result = suite.changed('source').run({
    source: 'ok',
    dependent: 1,
  } as never);
  expect(result.hasErrors('dependent' as never)).toBe(true);
});

it('runs a changed field and its direct dependents, retaining other errors', () => {
  const first = vi.fn();
  const second = vi.fn();
  const third = vi.fn();
  const schema = enforce.shape({
    first: enforce.isString(),
    second: enforce.isString().dependsOn($ => $.first),
    third: enforce.isString(),
  });
  const suite = create(() => {
    test('first', first);
    test('second', second);
    test('third', third);
  }, schema);
  suite.run({ first: 'a', second: 'ok', third: 3 } as never);
  first.mockClear();
  second.mockClear();
  third.mockClear();

  const result = suite.changed('first').run({
    first: 'b',
    second: 'ok',
    third: 3,
  } as never);
  expect(first).toHaveBeenCalledOnce();
  expect(second).toHaveBeenCalledOnce();
  expect(third).not.toHaveBeenCalled();
  expect(result.hasErrors('second')).toBe(false);
  expect(result.hasErrors('third')).toBe(true);
  expect(
    suite
      .changed('first')
      .run({ first: 'c', second: 'ok', third: 3 } as never)
      .hasErrors('third'),
  ).toBe(true);
});

it('treats an empty changed list as running no fields', () => {
  const called = vi.fn();
  const suite = create(() => test('a', called));
  suite.run();
  called.mockClear();
  suite.changed([]).run();
  expect(called).not.toHaveBeenCalled();
});

it('reports the selected fields as the run focus', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  const suite = create(() => {}, schema);
  const data = { a: 'a', b: 'b' };

  expect(suite.changed('a').run(data).run.focus).toEqual({ only: ['a', 'b'] });
  expect(suite.changed([]).run(data).run.focus).toEqual({});
  expect(
    create(() => {})
      .changed([])
      .run().run.focus,
  ).toEqual({});
});

it('keeps previous schema errors when changed([]) runs', () => {
  const schema = enforce.shape({ a: enforce.isString() });
  const suite = create(() => test('a', () => true), schema);
  expect(suite.run({ a: 1 } as never).hasErrors('a')).toBe(true);
  expect(suite.changed([]).run({ a: 'ok' }).hasErrors('a')).toBe(true);
});

it('unions explicit only fields and lets skip exclude a dependent', () => {
  const calls = { first: vi.fn(), second: vi.fn(), third: vi.fn() };
  const schema = enforce.shape({
    first: enforce.isString(),
    second: enforce.isString().dependsOn($ => $.first),
    third: enforce.isString(),
  });
  const suite = create(() => {
    test('first', calls.first);
    test('second', calls.second);
    test('third', calls.third);
  }, schema);

  suite.changed('first').only('third').focus({ skip: 'second' }).run({
    first: 'a',
    second: 'b',
    third: 'c',
  });
  expect(calls.first).toHaveBeenCalledOnce();
  expect(calls.second).not.toHaveBeenCalled();
  expect(calls.third).toHaveBeenCalledOnce();
});

it('passes the same parsed callback input as only() for the selected fields', () => {
  const seen: unknown[] = [];
  const schema = enforce.shape({
    first: enforce.isString().trim(),
    second: enforce.isString(),
  });
  const suite = create(data => {
    seen.push(data);
    test('first', () => true);
  }, schema);
  suite.only('first').run({ first: ' a ', second: 'b' });
  suite.changed('first').run({ first: ' a ', second: 'b' });
  expect(seen[1]).toEqual(seen[0]);
});

it('does not throw for missing or malformed data', () => {
  const schema = enforce.shape({
    first: enforce.isString(),
    second: enforce.isString().dependsOn($ => $.first),
  });
  const suite = create(() => test('first', () => true), schema);
  expect(() => suite.changed('first').run(null as never)).not.toThrow();
  expect(() => suite.changed('first').run([] as never)).not.toThrow();
});

it('selects many direct dependents without losing fields', () => {
  const fields: Record<string, ReturnType<typeof enforce.isString>> = {
    source: enforce.isString(),
  };
  for (let i = 0; i < 2000; i++) {
    fields[`dependent${i}`] = enforce.isString().dependsOn($ => $.source);
  }
  const data = Object.fromEntries(Object.keys(fields).map(key => [key, 'ok']));
  const suite = create(() => test('source', () => true), enforce.shape(fields));
  const start = performance.now();
  const result = suite.changed('source').run(data);
  expect(performance.now() - start).toBeLessThan(1000);
  expect(result.run.focus?.only).toHaveLength(2001);
});

it('runs a changed field that has user tests but no schema path', () => {
  const calls: string[] = [];
  const suite = create(
    () => {
      test('nickname', () => void calls.push('nickname'));
      test('password', () => void calls.push('password'));
    },
    enforce.loose({ password: enforce.isString() }),
  );
  suite.changed('nickname').run({ password: 'x', nickname: 'n' } as never);
  expect(calls).toEqual(['nickname']);
});

it('reports unrelated whole-schema failures without running their user tests', () => {
  const calls: string[] = [];
  const suite = create(
    () => {
      test('a', () => void calls.push('a'));
      test('b', () => void calls.push('b'));
    },
    enforce.partial({ a: enforce.isString(), b: enforce.isString() }),
  );
  const result = suite.changed('a').run({ a: 'x', b: 5 } as never);
  expect(calls).toEqual(['a']);
  expect(result.hasErrors('b')).toBe(true);
});

it('reports a failing array sibling without running its user test', () => {
  const calls: string[] = [];
  const schema = enforce.shape({
    rows: enforce.isArrayOf(
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      }),
    ),
  });
  const suite = create((data: any) => {
    data.rows.forEach((_: unknown, i: number) => {
      test(`rows.${i}.a`, () => void calls.push(`rows.${i}.a`));
      test(`rows.${i}.b`, () => void calls.push(`rows.${i}.b`));
    });
  }, schema);
  const result = suite.changed('rows.0.a').run({
    rows: [
      { a: 'x', b: 'y' },
      { a: 'x', b: 1 },
    ],
  } as never);
  expect(calls).toEqual(['rows.0.a', 'rows.0.b']);
  expect(result.hasErrors('rows.1.b' as never)).toBe(true);
});

it('does not report a skipped schema failure', () => {
  const suite = create(
    () => {},
    enforce.partial({ a: enforce.isString(), b: enforce.isString() }),
  );
  const result = suite
    .focus({ skip: 'b' })
    .changed('a')
    .run({ a: 'x', b: 5 } as never);
  expect(result.hasErrors('b')).toBe(false);
});

it('returns only the validated fields as the parsed value', () => {
  const suite = create(
    () => {
      test('name', () => true);
      test('other', () => true);
    },
    enforce.shape({
      name: enforce.isString().trim(),
      other: enforce.isString().trim(),
    }),
  );
  suite.run({ name: ' a ', other: ' b ' });
  const result = suite.changed('name').run({ name: ' c ', other: ' b ' });
  expect(result.valid).toBe(true);
  expect(result.value).toEqual({ name: 'c' });
});

it('never makes a partially validated schema-only suite valid', () => {
  const suite = create(
    () => {},
    enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
  );
  expect(suite.changed('a').run({ a: 'ok', b: 1 } as never).valid).toBe(false);
  expect(suite.changed([]).run({ a: 1, b: 1 } as never).valid).toBe(false);
});

it('runs dependents of a cleared lazy container', () => {
  const profile = enforce.shape({ name: enforce.isString() });
  const schema = enforce.shape({
    profile: enforce.optional(enforce.lazy(() => profile)),
    greeting: enforce.isString().dependsOn($ => $.root.profile.name),
  });
  const greeting = vi.fn();
  const suite = create(() => test('greeting', greeting), schema);

  suite.changed('profile').run({ profile: null, greeting: 'hi' } as never);
  expect(greeting).toHaveBeenCalledOnce();
});
