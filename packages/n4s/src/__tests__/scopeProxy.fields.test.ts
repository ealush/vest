import { describe, it, expect } from 'vitest';

import { enforce, FIELD } from '../n4s';
import type { InternalRelationship } from '../schema/SchemaRelationship';
import { createScopeProxy, isDependencyRef } from '../schema/scopeProxy';
import type { ScopeHandle } from '../utils/RuleInstance';

function pathKeys(path: unknown): string[] {
  if (!Array.isArray(path)) {
    return [];
  }
  return (path as unknown as Array<{ key?: unknown }>).map(
    (seg: { key?: unknown }): string => String(seg.key),
  );
}

function sourcesFor(
  described: { relationships: InternalRelationship[] },
  target: string,
): string[] {
  return described.relationships
    .filter(
      (rel: InternalRelationship): boolean =>
        pathKeys(rel.target).join('.') === target,
    )
    .map((rel: InternalRelationship): string => pathKeys(rel.source).join('.'));
}

describe('scopeProxy field collisions', (): void => {
  it('chains a nested field named path as a reference', (): void => {
    const inner = enforce.shape({ path: enforce.isString() });
    const schema = enforce.shape({
      nested: inner,
      watcher: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.nested.path),
    });

    expect(sourcesFor(schema.describe(), 'watcher')).toEqual(['nested.path']);
    expect(schema.test({ nested: { path: 'x' }, watcher: 'y' })).toBe(true);
  });

  it('chains a nested field named isRoot as a reference', (): void => {
    const inner = enforce.shape({ isRoot: enforce.isString() });
    const schema = enforce.shape({
      nested: inner,
      watcher: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.nested.isRoot),
    });

    expect(sourcesFor(schema.describe(), 'watcher')).toEqual(['nested.isRoot']);
  });

  it('chains nested fields named toJSON and valueOf as references', (): void => {
    const inner = enforce.shape({
      toJSON: enforce.isString(),
      valueOf: enforce.isString(),
    });
    const schema = enforce.shape({
      nested: inner,
      a: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.nested.toJSON),
      b: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.nested.valueOf),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['nested.toJSON']);
    expect(sourcesFor(schema.describe(), 'b')).toEqual(['nested.valueOf']);
  });

  it('references a real sibling field named self', (): void => {
    const schema = enforce.shape({
      self: enforce.isString(),
      a: enforce.isString().dependsOn(($: ScopeHandle): unknown => $.self),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['self']);
  });

  it('treats bare $.self as a self-dependency no-op when no sibling exists', (): void => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn(($: ScopeHandle): unknown => $.self),
    });

    expect(schema.describe().relationships).toEqual([]);
    expect(schema.test({ a: 'x' })).toBe(true);
  });

  it('keeps then non-chainable so refs are never thenable', async (): Promise<void> => {
    const $ = createScopeProxy([]);
    expect($.then).toBeUndefined();
    expect($.nested.then).toBeUndefined();
    expect($.root.then).toBeUndefined();

    const ref = $.nested;
    expect(isDependencyRef(ref)).toBe(true);
    expect(isDependencyRef($.then)).toBe(false);
    // Awaiting a returned ref must fulfill with the ref, not assimilate it.
    await expect(Promise.resolve(ref)).resolves.toBe(ref);
  });

  it('throws EnforceSchemaError when a resolver returns the non-chainable then', (): void => {
    expect((): unknown =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn(($: ScopeHandle): unknown => $.then),
      }),
    ).toThrow(/returned undefined/);
  });

  it('references a literal field named then via the FIELD escape hatch', (): void => {
    const schema = enforce.shape({
      then: enforce.isString(),
      nested: enforce.shape({ then: enforce.isString() }),
      a: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $[FIELD]('then')),
      b: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.nested[FIELD]('then')),
      c: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.root[FIELD]('then')),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['then']);
    expect(sourcesFor(schema.describe(), 'b')).toEqual(['nested.then']);
    expect(sourcesFor(schema.describe(), 'c')).toEqual(['then']);
  });

  it('references a literal then field with full typing and no cast', (): void => {
    const schema = enforce.shape({
      then: enforce.isString(),
      nested: enforce.shape({ then: enforce.isString() }),
      a: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $[FIELD]('then')),
      b: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.nested[FIELD]('then')),
      c: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.root[FIELD]('then')),
    });

    expect(sourcesFor(schema.describe(), 'a')).toEqual(['then']);
    expect(sourcesFor(schema.describe(), 'b')).toEqual(['nested.then']);
    expect(sourcesFor(schema.describe(), 'c')).toEqual(['then']);
    expect(
      schema.test({
        then: 't',
        nested: { then: 'nt' },
        a: 'x',
        b: 'y',
        c: 'z',
      }),
    ).toBe(true);
  });

  it('keeps normal deep chaining working', (): void => {
    const deep = enforce.shape({ leaf: enforce.isString() });
    const mid = enforce.shape({ branch: deep });
    const schema = enforce.shape({
      tree: mid,
      watcher: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.tree.branch.leaf),
    });

    expect(sourcesFor(schema.describe(), 'watcher')).toEqual([
      'tree.branch.leaf',
    ]);
  });

  it('keeps $.root and deferred $.parent semantics', (): void => {
    const inner = enforce.shape({
      taxId: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.root.accountType),
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
    expect((): unknown => createScopeProxy([]).parent).toThrow(
      /\$\.parent deferred to v2/,
    );
  });

  it('stores reference metadata off string keys', (): void => {
    const $ = createScopeProxy([]);
    for (const name of ['path', 'isRoot', 'toJSON', 'valueOf', 'self']) {
      expect(isDependencyRef($.nested[name])).toBe(true);
    }
  });
});

describe('dependsOn resolver results', (): void => {
  it('throws EnforceSchemaError for undefined (missing return)', (): void => {
    expect((): void => {
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn(($: ScopeHandle): unknown => {
          if ($.a) {
            // field accessed but intentionally never returned
          }
          return undefined;
        }),
      });
    }).toThrow(/returned undefined/);
  });

  it('treats an explicit empty array as intentional zero dependencies', (): void => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn((): unknown[] => []),
    });

    expect(schema.describe().relationships).toEqual([]);
    expect(schema.test({ a: 'x', b: 'y' })).toBe(true);
  });

  it('keeps throwing for scalar and mixed-array invalid results', (): void => {
    expect((): unknown =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn((): string => 'a'),
      }),
    ).toThrow(/must return a dependency ref/);
    expect((): unknown =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce
          .isString()
          .dependsOn(($: ScopeHandle): unknown[] => [$.a, 'nope']),
      }),
    ).toThrow(/non-dependency values/);
  });
});

describe('standalone rooted-path boundary', (): void => {
  it('reports dangling roots via describe() but throws at test()/run()', (): void => {
    const standalone = enforce.shape({
      a: enforce.isString(),
      b: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.root.missing),
    });

    expect(sourcesFor(standalone.describe(), 'b')).toEqual(['missing']);
    expect((): unknown => standalone.test({ a: 'a', b: 'b' })).toThrowError(
      /"b" depends on unknown field "missing"/,
    );
  });

  it('keeps composition lenient for reusable fragments', (): void => {
    const inner = enforce.shape({
      taxId: enforce
        .isString()
        .dependsOn(($: ScopeHandle): unknown => $.root.accountType),
    });

    // A middle mount without the provider must not throw: the fragment
    // cannot know its final root until mounted.
    const middle = enforce.shape({ company: inner, note: enforce.isString() });
    expect(middle.describe()).toBeDefined();

    // The middle schema alone still dangles, so its own run throws…
    expect((): unknown =>
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
