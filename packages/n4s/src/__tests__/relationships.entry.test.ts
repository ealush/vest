import { expect, it } from 'vitest';

import '../exports/relationships';
import { FIELD, type Scope } from '../exports/relationships';
import { compose, enforce } from '../n4s';

it('resolves single, multiple, chained and repeated dependencies', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString(),
    c: enforce
      .isString()
      .dependsOn($ => $.a)
      .dependsOn($ => [$.a, $.b]),
  });
  expect(schema.describe()).toEqual({
    relationships: [
      { source: ['a'], target: ['c'], effect: 'invalidate' },
      { source: ['b'], target: ['c'], effect: 'invalidate' },
    ],
  });
});

it('catches typos on first describe with the full path and useful suggestion', () => {
  const schema = enforce.shape({
    password: enforce.isString(),
    confirm: enforce.isString().dependsOn($ => $.pasword),
  });
  expect(() => schema.describe()).toThrow(/confirm.*pasword.*password/);
  expect(schema.test({ password: 'a', confirm: 'a' })).toBe(true);
});

it('does not suggest the dependent field itself', () => {
  const schema = enforce.shape({ b: enforce.isString().dependsOn($ => $.a) });
  expect(() => schema.describe()).toThrow(/unknown field "a"/);
  expect(() => schema.describe()).not.toThrow(/Did you mean "b"/);
});

it('rejects invalid resolver returns and handles the reserved then field', () => {
  const schema = enforce.shape({
    then: enforce.isString(),
    target: enforce.isString().dependsOn($ => $[FIELD]('then')),
  });
  expect(schema.describe().relationships[0].source).toEqual(['then']);
  for (const resolver of [
    () => undefined,
    () => 'then',
    ($: Scope) => $,
    () => Promise.resolve('then'),
  ]) {
    const invalid = enforce.shape({
      target: enforce.isString().dependsOn(resolver as never),
    });
    expect(() => invalid.describe()).toThrow(/target.*field reference/);
  }
});

it('defers validation of rooted references and names the full missing path', () => {
  const item = enforce.shape({
    state: enforce.isString().dependsOn($ => $.root.account.countree),
  });
  const schema = enforce.shape({
    account: enforce.shape({ country: enforce.isString() }),
    item,
  });
  expect(() => schema.describe()).toThrow(
    /item.state.*account.countree.*country/,
  );
});

it('does not execute an accessor while inspecting structure', () => {
  const shape = {
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  };
  const schema = enforce.shape(shape);
  Object.defineProperty(shape, 'unused', {
    enumerable: true,
    get() {
      throw new Error('getter');
    },
  });
  expect(schema.describe().relationships).toHaveLength(1);
});

it('rebases a shared nested shape separately for both mounts', () => {
  const address = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country),
  });
  const schema = enforce.shape({ bill: address, ship: address });
  expect(schema.describe().relationships).toEqual([
    {
      source: ['bill', 'country'],
      target: ['bill', 'state'],
      effect: 'invalidate',
    },
    {
      source: ['ship', 'country'],
      target: ['ship', 'state'],
      effect: 'invalidate',
    },
  ]);
});

it('scopes dependencies to the same array item or record key', () => {
  const item = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country),
  });
  const schema = enforce.shape({
    rows: enforce.isArrayOf(item),
    dict: enforce.record(item),
  });
  const edges = schema.describe().relationships;
  expect(edges[0].source).toEqual([
    'rows',
    { type: 'item', binding: 'isArrayOf' },
    'country',
  ]);
  expect(edges[0].target).toEqual([
    'rows',
    { type: 'item', binding: 'isArrayOf' },
    'state',
  ]);
  expect(edges[1].source).toEqual([
    'dict',
    { type: 'item', binding: 'record' },
    'country',
  ]);
});

it('records tuple positions and resolves a lazy factory once', () => {
  let calls = 0;
  const schema = enforce.shape({
    tuple: enforce.tuple(
      enforce.isString(),
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      }),
    ),
    deferred: enforce.lazy(() => {
      calls++;
      return enforce.shape({
        value: enforce.isString(),
        copy: enforce.isString().dependsOn($ => $.value),
      });
    }),
    mirror: enforce.isString().dependsOn($ => $.deferred.value),
  });
  expect(schema.describe().relationships).toEqual([
    {
      source: ['tuple', '1', 'a'],
      target: ['tuple', '1', 'b'],
      effect: 'invalidate',
    },
    {
      source: ['deferred', 'value'],
      target: ['deferred', 'copy'],
      effect: 'invalidate',
    },
    {
      source: ['deferred', 'value'],
      target: ['mirror'],
      effect: 'invalidate',
    },
  ]);
  expect(
    schema.test({
      tuple: ['x', { a: 'a', b: 'b' }],
      deferred: { value: 'v', copy: 'c' },
      mirror: 'm',
    }),
  ).toBe(true);
  expect(calls).toBe(1);
});

it('rejects dependsOn inside a recursive lazy schema', () => {
  const category: any = enforce.shape({
    name: enforce.isString(),
    title: enforce.isString().dependsOn($ => $.name),
    children: enforce.isArrayOf(enforce.lazy(() => category)),
  });
  expect(() => category.describe()).toThrow(
    /children\.\*.*recursive lazy\(\).*dependsOn is not supported/,
  );
});

it('allows recursive lazy schemas without declarations', () => {
  const tree: any = enforce.shape({
    name: enforce.isString(),
    children: enforce.isArrayOf(enforce.lazy(() => tree)),
  });
  expect(tree.describe().relationships).toEqual([]);

  const fresh = (): any =>
    enforce.shape({ next: enforce.optional(enforce.lazy(() => fresh())) });
  expect(() => fresh().describe()).toThrow(/32 nested lazy\(\) expansions/);
});

it('rejects excessive lazy depth instead of silently omitting deeper dependencies', () => {
  let rule: any = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  for (let i = 0; i < 34; i++) {
    const child = rule;
    rule = enforce.lazy(() => child);
  }
  expect(() => rule.describe()).toThrow(/32 nested lazy\(\) expansions/);
});

it('describes declarations and references inside compound rules', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.anyOf(
      enforce.isString().dependsOn($ => $.a),
      enforce.isNumber(),
    ),
    contact: enforce.oneOf(
      enforce.shape({ email: enforce.isString() }),
      enforce.shape({ phone: enforce.isString() }),
    ),
    c: enforce.isString().dependsOn($ => $.contact.phone),
  });
  expect(schema.describe().relationships).toEqual([
    { source: ['a'], target: ['b'], effect: 'invalidate' },
    { source: ['contact', 'phone'], target: ['c'], effect: 'invalidate' },
  ]);
});

it('resolves root references against the mounted schema and composed shapes', () => {
  const item = enforce.shape({
    price: enforce.isNumber().dependsOn($ => $.root.currency),
  });
  const schema = compose(
    enforce.shape({ currency: enforce.isString() }),
    enforce.shape({ rows: enforce.isArrayOf(item) }),
  );
  expect(schema.describe().relationships).toEqual([
    {
      source: ['currency'],
      target: ['rows', { type: 'item', binding: 'isArrayOf' }, 'price'],
      effect: 'invalidate',
    },
  ]);
});

it('returns a new rule and leaves a shared rule unchanged', () => {
  const text = enforce.isString();
  const confirm = text.dependsOn($ => $.password);
  expect(confirm).not.toBe(text);

  const schema = enforce.shape({
    password: text,
    username: text,
    confirm,
  });
  const other = enforce.shape({ password: text, other: text });
  expect(schema.describe().relationships).toEqual([
    { source: ['password'], target: ['confirm'], effect: 'invalidate' },
  ]);
  expect(other.describe().relationships).toEqual([]);
});

it('keeps a derived rule validating like its base and chainable', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce
      .isString()
      .dependsOn($ => $.a)
      .minLength(2),
  });
  expect(schema.test({ a: 'a', b: 'bb' })).toBe(true);
  expect(schema.test({ a: 'a', b: 'b' })).toBe(false);
  expect(schema.describe().relationships).toEqual([
    { source: ['a'], target: ['b'], effect: 'invalidate' },
  ]);
});

it('isolates validation chains and messages when deriving a shared rule', () => {
  const text = enforce.isString();
  const short = text
    .dependsOn($ => $.a)
    .maxLength(2)
    .message('short');
  const long = text
    .dependsOn($ => $.a)
    .minLength(3)
    .message('long');
  expect(text.test('x')).toBe(true);
  expect(text.test('xxxx')).toBe(true);
  expect(short.test('x')).toBe(true);
  expect(short.run('xxx').message).toBe('short');
  expect(long.test('xxx')).toBe(true);
  expect(long.run('x').message).toBe('long');
  expect(
    enforce.shape({ a: text, short, long }).describe().relationships,
  ).toHaveLength(2);
});

it('keeps a derived composed rule callable and describes its own metadata', () => {
  const base = compose(enforce.isString());
  const derived = base.dependsOn($ => $.a);
  expect(() => derived('x')).not.toThrow();
  expect(() => derived(1 as never)).toThrow();
  // Describing this rule alone has no sibling a; its declaration must be seen.
  expect(() => derived.describe()).toThrow(/unknown field "a"/);
  expect(base.describe().relationships).toEqual([]);
});

it('hints at FIELD for a field named root', () => {
  const schema = enforce.shape({
    root: enforce.isString(),
    x: enforce.isString().dependsOn($ => $.root),
  });
  expect(() => schema.describe()).toThrow(/\$\[FIELD\]\('name'\).*root/);
  const fixed = enforce.shape({
    root: enforce.isString(),
    x: enforce.isString().dependsOn($ => $[FIELD]('root')),
  });
  expect(fixed.describe().relationships[0].source).toEqual(['root']);
});

it('runs no validators or getters and returns independent JSON data', () => {
  let calls = 0;
  const a = enforce.condition(() => {
    calls++;
    return true;
  });
  const schema = enforce.shape({
    a,
    b: enforce.isString().dependsOn($ => $.a),
  });
  const first = schema.describe();
  expect(calls).toBe(0);
  expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  (first.relationships[0].source as string[])[0] = 'corrupt';
  expect(schema.describe().relationships[0].source[0]).toBe('a');
});

it('does not expose relationships from omitted or unpicked fields', () => {
  const fields = {
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
    c: enforce.isString().dependsOn($ => $.a),
  };
  expect(enforce.pick(fields, ['a', 'b']).describe().relationships).toEqual([
    { source: ['a'], target: ['b'], effect: 'invalidate' },
  ]);
  expect(enforce.omit(fields, 'c').describe().relationships).toHaveLength(1);
});

it('tracks a dependency added to a composed rule', () => {
  const composed = compose(enforce.isString()).dependsOn($ => $.a);
  const schema = enforce.shape({ a: enforce.isString(), b: composed });
  expect(schema.describe().relationships).toEqual([
    { source: ['a'], target: ['b'], effect: 'invalidate' },
  ]);
});

it('rejects an unsupported parent reference with dependent field context', () => {
  const schema = enforce.shape({
    b: enforce.isString().dependsOn($ => $.parent.a),
  });
  expect(() => schema.describe()).toThrow(/b.*parent is not supported/);
});
