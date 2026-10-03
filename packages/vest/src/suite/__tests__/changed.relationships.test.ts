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
