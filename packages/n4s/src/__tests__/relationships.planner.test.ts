import { expect, it } from 'vitest';

import { resolveAffected } from '../exports/relationships';
import { enforce } from '../n4s';

it('selects one hop, deduplicates paths and terminates cycles', () => {
  const schema = enforce.shape({
    a: enforce.isString().dependsOn($ => $.c),
    b: enforce.isString().dependsOn($ => $.a),
    c: enforce.isString().dependsOn($ => $.b),
  });
  expect(resolveAffected(schema, ['a', 'a'], {})).toEqual([['a'], ['b']]);
  expect(resolveAffected(schema, ['a', 'b'], {})).toEqual([
    ['a'],
    ['b'],
    ['c'],
  ]);
});

it('binds dependencies to an array index and fans root references out', () => {
  const item = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country),
    price: enforce.isNumber().dependsOn($ => $.root.currency),
  });
  const schema = enforce.shape({
    currency: enforce.isString(),
    rows: enforce.isArrayOf(item),
  });
  const data = { currency: 'USD', rows: [{}, {}, {}] };
  expect(resolveAffected(schema, ['rows[1].country'], data)).toEqual([
    ['rows', 1, 'country'],
    ['rows', 1, 'state'],
  ]);
  expect(resolveAffected(schema, ['rows.1.country'], data)).toEqual(
    resolveAffected(schema, ['rows[1].country'], data),
  );
  expect(resolveAffected(schema, ['currency'], data)).toEqual([
    ['currency'],
    ['rows', 0, 'price'],
    ['rows', 1, 'price'],
    ['rows', 2, 'price'],
  ]);
});

it('expands a named whole object through declared fields and current items', () => {
  const item = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  const schema = enforce.shape({ rows: enforce.isArrayOf(item) });
  expect(resolveAffected(schema, ['rows'], { rows: [{}, {}] })).toEqual([
    ['rows'],
    ['rows', 0],
    ['rows', 0, 'a'],
    ['rows', 0, 'b'],
    ['rows', 1],
    ['rows', 1, 'a'],
    ['rows', 1, 'b'],
  ]);
});

it('invalidates direct dependencies on an ancestor of a changed field', () => {
  const item = enforce.shape({
    details: enforce.shape({ name: enforce.isString() }),
    summary: enforce.isString().dependsOn($ => $.details),
  });
  const schema = enforce.shape({
    rows: enforce.isArrayOf(item),
    total: enforce.isNumber().dependsOn($ => $.rows),
    next: enforce.isString().dependsOn($ => $.total),
  });
  expect(
    resolveAffected(schema, ['rows.1.details.name'], { rows: [{}, {}] }),
  ).toEqual([
    ['rows', 1, 'details', 'name'],
    ['total'],
    ['rows', 1, 'summary'],
  ]);
});

it('does not cache fan-out against an earlier array or record value', () => {
  const schema = enforce.shape({
    source: enforce.isString(),
    rows: enforce.isArrayOf(enforce.isString().dependsOn($ => $.root.source)),
    dict: enforce.record(enforce.isString().dependsOn($ => $.root.source)),
  });
  expect(
    resolveAffected(schema, ['source'], { rows: ['a'], dict: { a: 'x' } }),
  ).toHaveLength(3);
  expect(
    resolveAffected(schema, ['source'], {
      rows: ['a', 'b'],
      dict: { b: 'x', c: 'x' },
    }),
  ).toEqual([
    ['source'],
    ['rows', 0],
    ['rows', 1],
    ['dict', 'b'],
    ['dict', 'c'],
  ]);
});

it('returns cache results that cannot mutate later selections', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  const first = resolveAffected(schema, ['a'], {});
  first.pop();
  expect(resolveAffected(schema, ['a'], {})).toEqual([['a'], ['b']]);
});

it('binds a record dependency to its own key', () => {
  const item = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  const schema = enforce.shape({ dict: enforce.record(item) });
  expect(
    resolveAffected(schema, ['dict.left.a'], { dict: { left: {}, right: {} } }),
  ).toEqual([
    ['dict', 'left', 'a'],
    ['dict', 'left', 'b'],
  ]);
});

it('fans a root field out to every record key', () => {
  const schema = enforce.shape({
    locale: enforce.isString(),
    dict: enforce.record(
      enforce.shape({
        value: enforce.isString().dependsOn($ => $.root.locale),
      }),
    ),
  });
  const data = { locale: 'en', dict: { left: {}, right: {} } };
  expect(resolveAffected(schema, ['locale'], data)).toEqual([
    ['locale'],
    ['dict', 'left', 'value'],
    ['dict', 'right', 'value'],
  ]);
});

it('follows recursive lazy schemas as deep as the data goes', () => {
  const tree: any = enforce.shape({
    name: enforce.isString(),
    children: enforce.isArrayOf(enforce.lazy(() => tree)),
  });
  const leaf = { name: 'c', children: [] };
  const data = { name: 'a', children: [{ name: 'b', children: [leaf] }] };
  expect(resolveAffected(tree, ['children.0.children.0.name'], data)).toEqual([
    ['children', 0, 'children', 0, 'name'],
  ]);
  expect(resolveAffected(tree, ['children.0'], data)).toEqual([
    ['children', 0],
    ['children', 0, 'name'],
    ['children', 0, 'children'],
    ['children', 0, 'children', 0],
    ['children', 0, 'children', 0, 'name'],
    ['children', 0, 'children', 0, 'children'],
  ]);

  const cyclic: any = { name: 'x', children: [] };
  cyclic.children.push(cyclic);
  expect(resolveAffected(tree, ['children'], cyclic).length).toBeLessThan(10);

  const fresh = (): any =>
    enforce.shape({ next: enforce.optional(enforce.lazy(() => fresh())) });
  expect(() => resolveAffected(fresh(), ['next'], {})).toThrow(
    /32 nested lazy\(\) expansions/,
  );
});

it('keeps a literal dotted key separate from nested paths', () => {
  const schema = enforce.shape({
    'a.b': enforce.isString(),
    a: enforce.shape({
      b: enforce.isString(),
      c: enforce.isString().dependsOn($ => $.b),
    }),
    d: enforce.isString().dependsOn($ => $.root['a.b']),
  });
  expect(resolveAffected(schema, ['a.b'], { 'a.b': '', a: {} })).toEqual([
    ['a.b'],
    ['d'],
    ['a', 'b'],
    ['a', 'c'],
  ]);
});

it('ignores unsafe and unknown names and never reads data getters', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  const data = Object.defineProperty({}, 'a', {
    enumerable: true,
    get() {
      throw new Error('data getter ran');
    },
  });
  expect(resolveAffected(schema, ['a'], data)).toEqual([['a'], ['b']]);
  expect(
    resolveAffected(
      schema,
      ['', 'unknown', '__proto__', 'constructor', 'a[foo]'],
      data,
    ),
  ).toEqual([]);
});
