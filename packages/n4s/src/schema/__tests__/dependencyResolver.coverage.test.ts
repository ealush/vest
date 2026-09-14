import { describe, expect, it } from 'vitest';

import { compose, EnforceSchemaError, enforce } from '../../n4s';
import {
  assertSchemaRootPathsValid,
  resolveAffectedPaths,
} from '../../exports/internal';

/**
 * Graph-resolution branch coverage (GR02/GR03/GR05). Every case pins the
 * resolved plan: cycles terminate, duplicates collapse, scopes rebase,
 * invalid paths fail explicitly, and relationship collection survives
 * every container kind.
 */
describe('dependencyResolver coverage', () => {
  it('terminates cycles without duplicating targets', () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.b),
      b: enforce.isString().dependsOn($ => $.a),
    });
    expect(resolveAffectedPaths(schema, ['a']).sort()).toEqual(['a', 'b']);
  });

  it('collapses duplicate declarations and duplicate changes', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce
        .isString()
        .dependsOn($ => $.a)
        .dependsOn($ => $.a),
    });
    expect(resolveAffectedPaths(schema, ['a', 'a']).sort()).toEqual(['a', 'b']);
  });

  it('ignores self-edges silently', () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.a),
    });
    expect(resolveAffectedPaths(schema, ['a'])).toEqual(['a']);
  });

  it('binds union array members per index with an independent oracle', () => {
    const item = enforce.shape({
      country: enforce.isString(),
      passport: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      rows: enforce.isArrayOf(item),
    });
    const data = { rows: [{ country: 'A', passport: 'x' }] };
    expect(resolveAffectedPaths(schema, ['rows.0.country'], data)).toEqual([
      'rows.0.country',
      'rows.0.passport',
    ]);
  });

  it('binds union members inside records by key', () => {
    const item = enforce.shape({
      country: enforce.isString(),
      passport: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      rows: enforce.record(item),
    });
    const data = { rows: { first: { country: 'A', passport: 'x' } } };
    expect(resolveAffectedPaths(schema, ['rows.first.country'], data)).toEqual([
      'rows.first.country',
      'rows.first.passport',
    ]);
  });

  it('rebases one schema mounted at two paths without aliasing scope', () => {
    const item = enforce.shape({
      country: enforce.isString(),
      passport: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({ left: item, right: item });
    const data = {
      left: { country: 'A', passport: 'x' },
      right: { country: 'B', passport: 'y' },
    };
    expect(resolveAffectedPaths(schema, ['left.country'], data)).toEqual([
      'left.country',
      'left.passport',
    ]);
    expect(resolveAffectedPaths(schema, ['right.country'], data)).toEqual([
      'right.country',
      'right.passport',
    ]);
  });

  it('resolves nested and root references at depth', () => {
    const schema = enforce.shape({
      policy: enforce.isString(),
      company: enforce.shape({
        source: enforce.isString(),
        target: enforce
          .isString()
          .dependsOn($ => [$.source, $.root.policy] as never),
      }),
    });
    const data = {
      policy: 'ok',
      company: { source: 'ok', target: 'ok' },
    };
    expect(
      resolveAffectedPaths(schema, ['company.source'], data).sort(),
    ).toEqual(['company.source', 'company.target']);
    expect(resolveAffectedPaths(schema, ['policy'], data)).toContain(
      'company.target',
    );
  });

  it('defers unknown rooted paths to finalization instead of throwing', () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => ($.root as any).missing),
    });
    // Planning tolerates the unknown root; assertSchemaRootPathsValid
    // rejects it when the schema is mounted.
    expect(resolveAffectedPaths(schema, ['a'], { a: 'x' })).toEqual(['a']);
    expect(() => assertSchemaRootPathsValid(schema)).toThrow(
      EnforceSchemaError,
    );
  });

  it('rejects non-function dependency resolvers', () => {
    const broken = enforce.isString() as unknown as Record<symbol, unknown>;
    broken[Symbol.for('vest:unresolvedDeps')] = [{ resolver: 42 }];
    // Relationship collection runs at construction, so the malformed
    // slot fails fast there instead of reaching the planner.
    expect(() =>
      enforce.shape({
        a: broken as never,
      }),
    ).toThrow(EnforceSchemaError);
  });

  it('keeps composed children resolvable through nesting', () => {
    const schema = enforce.shape({
      outer: compose(
        enforce.shape({
          a: enforce.isString(),
          b: enforce.isString().dependsOn($ => $.a),
        }),
      ),
    });
    expect(
      resolveAffectedPaths(schema, ['outer.a'], { outer: { a: 1, b: 2 } }),
    ).toEqual(['outer.a', 'outer.b']);
  });

  it('ignores removed dangling omit members without probing', () => {
    const members = {
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString().dependsOn(($: any) => $.missing),
    };
    const omitted = enforce.omit(members, ['c']);
    expect(resolveAffectedPaths(omitted, ['a'], { a: 1, b: 2 }).sort()).toEqual(
      ['a', 'b'],
    );
  });

  it('resolves without run data through declaration-only paths', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    expect(resolveAffectedPaths(schema, ['a'])).toEqual(['a', 'b']);
    expect(resolveAffectedPaths(schema, ['b'])).toEqual(['b']);
  });

  it('tolerates foreign members without describe metadata', () => {
    const foreign = {
      run: (value: unknown) => ({ pass: true, type: value }),
    };
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.b),
      b: enforce.isString(),
      f: foreign as never,
    });
    expect(resolveAffectedPaths(schema, ['b'], { a: 1, b: 2 }).sort()).toEqual([
      'a',
      'b',
    ]);
  });

  it('binds dynamic record keys to the same key without declaration', () => {
    const item = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({ dict: enforce.record(item) });
    const data = { dict: { zz9: { country: 'A', state: 'x' } } };
    expect(resolveAffectedPaths(schema, ['dict.zz9.country'], data)).toEqual([
      'dict.zz9.country',
      'dict.zz9.state',
    ]);
  });

  it('rejects unknown fields inside array items at construction', () => {
    expect(() =>
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.shape({
            x: enforce.isString().dependsOn(($: any) => $.missing),
          }),
        ),
      }),
    ).toThrow(EnforceSchemaError);
  });

  it('quotes the unknown field for a deeply nested dangling endpoint', () => {
    expect(() =>
      enforce.shape({
        p: enforce.shape({
          q: enforce.shape({
            x: enforce.isString().dependsOn(($: any) => $.missing),
          }),
        }),
      }),
    ).toThrow(/"x" depends on unknown field "missing"/);
  });

  it('rejects dependencies descending from scalar fields', () => {
    expect(() =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn(($: any) => $.a.deep),
      }),
    ).toThrow(EnforceSchemaError);
  });

  it('rejects unknown fields inside record items at construction', () => {
    expect(() =>
      enforce.shape({
        dict: enforce.record(
          enforce.shape({
            x: enforce.isString().dependsOn(($: any) => $.missing),
          }),
        ),
      }),
    ).toThrow(EnforceSchemaError);
  });

  it('accepts rooted references to declared root fields', () => {
    const schema = enforce.shape({
      policy: enforce.isString(),
      company: enforce.shape({
        target: enforce.isString().dependsOn($ => $.root.policy),
      }),
    });
    expect(
      resolveAffectedPaths(schema, ['policy'], {
        policy: 'ok',
        company: { target: 'ok' },
      }),
    ).toContain('company.target');
  });

  it('rejects rooted references to missing root fields', () => {
    const schema = enforce.shape({
      company: enforce.shape({
        target: enforce.isString().dependsOn($ => ($.root as any).missing),
      }),
    });
    // Rooted validation is deferred to mount/finalization.
    expect(
      resolveAffectedPaths(schema, ['company.target'], {
        company: { target: 'ok' },
      }),
    ).toEqual(['company.target']);
    expect(() => assertSchemaRootPathsValid(schema)).toThrow(
      EnforceSchemaError,
    );
  });

  it('suggests similarly named fields for typos', () => {
    expect(() =>
      enforce.shape({
        password: enforce.isString(),
        confirm: enforce.isString().dependsOn(($: any) => $.passwrod),
      }),
    ).toThrow(/Did you mean "password"/);
  });

  it('resolves array-index changes against item patterns without confusion', () => {
    const item = enforce.shape({
      country: enforce.isString(),
      passport: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      rows: enforce.isArrayOf(item),
      other: enforce.isString(),
    });
    const data = {
      rows: [{ country: 'A', passport: 'x' }],
      other: 'ok',
    };
    // Property-vs-item and binding comparisons run on every resolution.
    expect(resolveAffectedPaths(schema, ['rows.0.country'], data)).toEqual([
      'rows.0.country',
      'rows.0.passport',
    ]);
    expect(resolveAffectedPaths(schema, ['other'], data)).toEqual(['other']);
  });

  it('skips falsy shape members without failing', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: undefined as never,
    });
    expect(resolveAffectedPaths(schema, ['a'], { a: 'x' })).toEqual(['a']);
  });

  it('ignores non-rule inputs at rooted finalization', () => {
    expect(assertSchemaRootPathsValid(null)).toBeUndefined();
    expect(assertSchemaRootPathsValid(42 as never)).toBeUndefined();
    expect(
      assertSchemaRootPathsValid(enforce.shape({ a: enforce.isString() })),
    ).toBeUndefined();
  });

  it('validates composed array children through merged item shapes', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          passport: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });
    const data = { rows: [{ country: 'A', passport: 'x' }] };
    expect(resolveAffectedPaths(schema, ['rows.0.country'], data)).toEqual([
      'rows.0.country',
      'rows.0.passport',
    ]);
    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
  });

  it('walks nested, composed, array, tuple, and record scopes in finalization', () => {
    const schema = enforce.shape({
      policy: enforce.isString(),
      company: enforce.shape({
        source: enforce.isString(),
        target: enforce
          .isString()
          .dependsOn($ => [$.source, $.root.policy] as never),
      }),
      fleet: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          tax: enforce
            .isString()
            .dependsOn($ => [$.country, $.root.policy] as never),
        }),
      ),
      pair: enforce.tuple(enforce.isString(), enforce.isNumeric()),
      dict: enforce.record(
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
      nested: compose(
        enforce.shape({
          deep: enforce.shape({
            x: enforce.isString(),
            y: enforce.isString().dependsOn($ => $.x),
          }),
        }),
      ),
    });
    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
    const data = {
      policy: 'ok',
      company: { source: 's', target: 't' },
      fleet: [{ country: 'A', tax: 'x' }],
      pair: ['s', 1],
      dict: { home: { country: 'A', state: 'x' } },
      nested: { deep: { x: 'a', y: 'b' } },
    };
    expect(resolveAffectedPaths(schema, ['fleet.0.country'], data)).toContain(
      'fleet.0.tax',
    );
    expect(resolveAffectedPaths(schema, ['dict.home.country'], data)).toContain(
      'dict.home.state',
    );
  });

  it.each([
    ['shape field', () => enforce.shape({ x: dangling() })],
    [
      'nested field',
      () => enforce.shape({ p: enforce.shape({ x: dangling() }) }),
    ],
    [
      'array item',
      () =>
        enforce.shape({
          rows: enforce.isArrayOf(enforce.shape({ x: dangling() })),
        }),
    ],
    [
      'record item',
      () =>
        enforce.shape({
          dict: enforce.record(enforce.shape({ x: dangling() })),
        }),
    ],
    ['composed child', () => compose(enforce.shape({ x: dangling() }))],
  ])('rejects unknown fields in %s', (_label, build) => {
    // Construction-throwing placements fail inside build(); either way the
    // dangling reference is rejected, never silently kept.
    expect(() =>
      assertSchemaRootPathsValid((build as () => unknown)()),
    ).toThrow(EnforceSchemaError);
  });

  it('tolerates bare dangling tuple members without validation (open GR05 limit)', () => {
    // Known limitation: tuple members never resolve inline dependencies,
    // so a bare dangling reference inside one is invisible to both
    // construction and finalization. This pins the current traversal
    // behavior for branch coverage; it must change when tuple dependency
    // scope (including $root) is specified.
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.isString(), dangling()),
    });
    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
  });

  it('collects resolved edges from tuple members at finalization', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(
        enforce.isString(),
        enforce.shape({
          a: enforce.isString(),
          b: enforce.isString().dependsOn($ => $.a),
        }),
      ),
    });
    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
    expect(
      resolveAffectedPaths(schema, ['pair.1.a'], {
        pair: ['x', { a: 1, b: 2 }],
      }),
    ).toContain('pair.1.b');
  });

  it.each([
    [
      'rooted source',
      () =>
        enforce.shape({
          x: enforce.isString().dependsOn($ => ($.root as any).nope),
        }),
    ],
    [
      'rooted nested target',
      () =>
        enforce.shape({
          p: enforce.shape({
            x: enforce.isString().dependsOn($ => ($.root as any).nope),
          }),
        }),
    ],
  ])('defers %s to finalization, then rejects', (_label, build) => {
    const schema = (build as () => unknown)();
    expect(() => assertSchemaRootPathsValid(schema)).toThrow(
      EnforceSchemaError,
    );
  });
});

function dangling() {
  return enforce.isString().dependsOn(($: any) => $.missing);
}
