import { describe, it, expect } from 'vitest';

import { enforce } from '../n4s';
import { FIELD, createScopeProxy, isDependencyRef } from '../schema/scopeProxy';

function pathKeys(path: unknown): string[] {
  return ((path ?? []) as Array<{ key?: unknown }>).map(seg => String(seg.key));
}

function sourcesFor(described: { relationships: any[] }, target: string) {
  return described.relationships
    .filter(rel => pathKeys(rel.target).join('.') === target)
    .map(rel => pathKeys(rel.source).join('.'));
}

describe('scopeProxy field collisions', () => {
  it('chains a nested field named path as a reference', () => {
    const inner = enforce.shape({ path: enforce.isString() });
    const schema = enforce.shape({
      nested: inner,
      watcher: enforce.isString().dependsOn($ => $.nested.path),
    });

    expect(sourcesFor(schema.describe(), 'watcher')).toEqual(['nested.path']);
    expect(schema.test({ nested: { path: 'x' }, watcher: 'y' })).toBe(true);
  });

  it('chains a nested field named isRoot as a reference', () => {
    const inner = enforce.shape({ isRoot: enforce.isString() });
    const schema = enforce.shape({
      nested: inner,
      watcher: enforce.isString().dependsOn($ => $.nested.isRoot),
    });

    expect(sourcesFor(schema.describe(), 'watcher')).toEqual(['nested.isRoot']);
  });

  it('chains nested fields named toJSON and valueOf as references', () => {
    const inner = enforce.shape({
      toJSON: enforce.isString(),
      valueOf: enforce.isString(),
    });
    const schema = enforce.shape({
      nested: inner,
      a: enforce.isString().dependsOn($ => $.nested.toJSON),
      b: enforce.isString().dependsOn($ => $.nested.valueOf),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['nested.toJSON']);
    expect(sourcesFor(schema.describe(), 'b')).toEqual(['nested.valueOf']);
  });

  it('references a real sibling field named self', () => {
    const schema = enforce.shape({
      self: enforce.isString(),
      a: enforce.isString().dependsOn($ => $.self),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['self']);
  });

  it('treats bare $.self as a self-dependency no-op when no sibling exists', () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.self),
    });

    expect(schema.describe().relationships).toEqual([]);
    expect(schema.test({ a: 'x' })).toBe(true);
  });

  it('keeps then non-chainable so refs are never thenable', async () => {
    const $ = createScopeProxy([]);
    expect(($ as any).then).toBeUndefined();
    expect(($ as any).nested.then).toBeUndefined();
    expect(($ as any).root.then).toBeUndefined();

    const ref = ($ as any).nested;
    expect(isDependencyRef(ref)).toBe(true);
    expect(isDependencyRef(($ as any).then)).toBe(false);
    // Awaiting a returned ref must fulfill with the ref, not assimilate it.
    await expect(Promise.resolve(ref)).resolves.toBe(ref);
  });

  it('throws EnforceSchemaError when a resolver returns the non-chainable then', () => {
    expect(() =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => ($ as any).then),
      }),
    ).toThrow(/returned undefined/);
  });

  it('references a literal field named then via the FIELD escape hatch', () => {
    const schema = enforce.shape({
      then: enforce.isString(),
      nested: enforce.shape({ then: enforce.isString() }),
      a: enforce.isString().dependsOn($ => ($ as any)[FIELD]('then')),
      b: enforce.isString().dependsOn($ => ($ as any).nested[FIELD]('then')),
      c: enforce.isString().dependsOn($ => ($ as any).root[FIELD]('then')),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['then']);
    expect(sourcesFor(schema.describe(), 'b')).toEqual(['nested.then']);
    expect(sourcesFor(schema.describe(), 'c')).toEqual(['then']);
  });

  it('keeps normal deep chaining working', () => {
    const deep = enforce.shape({ leaf: enforce.isString() });
    const mid = enforce.shape({ branch: deep });
    const schema = enforce.shape({
      tree: mid,
      watcher: enforce.isString().dependsOn($ => $.tree.branch.leaf),
    });

    expect(sourcesFor(schema.describe(), 'watcher')).toEqual([
      'tree.branch.leaf',
    ]);
  });

  it('keeps $.root and deferred $.parent semantics', () => {
    const inner = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.accountType),
    });
    const outer = enforce.shape({
      accountType: enforce.isString(),
      company: inner,
    });

    expect(sourcesFor(outer.describe(), 'company.taxId')).toEqual([
      'accountType',
    ]);
    expect(
      outer.test({ accountType: 'personal', company: { taxId: '123' } }),
    ).toBe(true);
    expect(() => (createScopeProxy([]) as any).parent).toThrow(
      /\$\.parent deferred to v2/,
    );
  });

  it('stores reference metadata off string keys', () => {
    const $ = createScopeProxy([]);
    for (const name of ['path', 'isRoot', 'toJSON', 'valueOf', 'self']) {
      expect(isDependencyRef(($ as any).nested[name])).toBe(true);
    }
  });
});

describe('dependsOn resolver results', () => {
  it('throws EnforceSchemaError for undefined (missing return)', () => {
    expect(() =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => {
          if ($.a) {
            // field accessed but intentionally never returned
          }
        }),
      }),
    ).toThrow(/returned undefined/);
  });

  it('treats an explicit empty array as intentional zero dependencies', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn(() => []),
    });

    expect(schema.describe().relationships).toEqual([]);
    expect(schema.test({ a: 'x', b: 'y' })).toBe(true);
  });

  it('keeps throwing for scalar and mixed-array invalid results', () => {
    expect(() =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn(() => 'a' as any),
      }),
    ).toThrow(/must return a dependency ref/);
    expect(() =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => [$.a, 'nope' as any]),
      }),
    ).toThrow(/non-dependency values/);
  });
});

describe('standalone rooted-path boundary', () => {
  it('reports dangling roots via describe() but throws at test()/run()', () => {
    const standalone = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.root.missing),
    });

    expect(sourcesFor(standalone.describe(), 'b')).toEqual(['missing']);
    expect(() => standalone.test({ a: 'a', b: 'b' })).toThrowError(
      /"b" depends on unknown field "missing"/,
    );
  });

  it('keeps composition lenient for reusable fragments', () => {
    const inner = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.accountType),
    });

    // A middle mount without the provider must not throw: the fragment
    // cannot know its final root until mounted.
    const middle = enforce.shape({ company: inner, note: enforce.isString() });
    expect(middle.describe()).toBeDefined();

    // The middle schema alone still dangles, so its own run throws…
    expect(() =>
      middle.test({ company: { taxId: 'x' }, note: 'n' }),
    ).toThrowError(/"taxId" depends on unknown field "accountType"/);

    // …but the outer mount that provides the field is fully valid.
    const outer = enforce.shape({
      accountType: enforce.isString(),
      company: inner,
    });
    expect(outer.test({ accountType: 'p', company: { taxId: 'x' } })).toBe(
      true,
    );
  });
});
