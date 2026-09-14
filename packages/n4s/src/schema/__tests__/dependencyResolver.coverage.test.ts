import { describe, expect, it } from 'vitest';

import { compose, EnforceSchemaError, enforce } from '../../n4s';
import {
  assertSchemaRootPathsValid,
  resolveAffectedPaths,
} from '../../exports/internal';
import {
  assertRuleRootedPathsValid,
  resolveInlineDeps,
} from '../dependencyResolver';
import { propertySegment } from '../SchemaPath';
import {
  COMPOSITION_CHILDREN,
  ITEM_SCHEMA,
  RESOLVED_RELATIONSHIPS,
  UNRESOLVED_DEPS,
} from '../schemaSlots';
import { DEPENDENCY_REF, REF_IS_ROOT, REF_PATH } from '../scopeProxy';

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

describe('dependencyResolver uncovered branches', () => {
  it('ignores non-rule and non-list relationship slots at rule finalization', () => {
    expect(assertRuleRootedPathsValid(null)).toBeUndefined();
    expect(assertRuleRootedPathsValid(undefined)).toBeUndefined();
    expect(assertRuleRootedPathsValid(42 as never)).toBeUndefined();
    const exotic = enforce.isString() as unknown as Record<symbol, unknown>;
    exotic[RESOLVED_RELATIONSHIPS] = { not: 'an-array' };
    expect(assertRuleRootedPathsValid(exotic as never)).toBeUndefined();
  });

  it('returns early when a rule has no rooted relationships', () => {
    const local = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    expect(assertRuleRootedPathsValid(local as never)).toBeUndefined();
  });

  it('returns early when rooted rels have no root shape', () => {
    const orphan = {
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('x')],
          target: [prop('y')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(assertRuleRootedPathsValid(orphan)).toBeUndefined();
  });

  it('names unknown fields for empty and item endpoints', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    }) as unknown as Record<symbol, unknown>;
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a')],
        target: [],
        effect: 'invalidate',
        __isRootSource: true,
      },
    ] as never;
    expect(assertRuleRootedPathsValid(schema as never)).toBeUndefined();
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a')],
        target: [itemSeg('rows.$item')],
        effect: 'invalidate',
        __isRootSource: true,
      },
    ] as never;
    expect(assertRuleRootedPathsValid(schema as never)).toBeUndefined();
  });

  it('skips item segments and quotes dotted paths with bindings', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.shape({ x: enforce.isString() })),
    }) as unknown as Record<symbol, unknown>;
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('rows'), itemSeg('rows.$item'), prop('missing')],
        target: [prop('rows')],
        effect: 'invalidate',
        __isRootSource: true,
      },
    ] as never;
    expect(() => assertRuleRootedPathsValid(schema as never)).toThrow(
      /depends on unknown field "rows\.rows\.\$item\.missing"/,
    );
  });

  it('validates root-target endpoints at both finalizers', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    }) as unknown as Record<symbol, unknown>;
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a')],
        target: [prop('b')],
        effect: 'invalidate',
        __isRootTarget: true,
      },
    ] as never;
    expect(assertRuleRootedPathsValid(schema as never)).toBeUndefined();
    expect(assertSchemaRootPathsValid(schema as never)).toBeUndefined();
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [],
        target: [prop('b')],
        effect: 'invalidate',
        __isRootTarget: true,
      },
    ] as never;
    expect(assertSchemaRootPathsValid(schema as never)).toBeUndefined();
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a')],
        target: [prop('nope')],
        effect: 'invalidate',
        __isRootTarget: true,
      },
    ] as never;
    expect(() => assertRuleRootedPathsValid(schema as never)).toThrow(
      /depends on unknown field "nope"/,
    );
  });

  it('treats non-rule children as empty shapes', () => {
    const fake = {
      __schema: { a: 'scalar-not-a-rule' },
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('a'), prop('deep')],
          target: [prop('x')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(() => assertRuleRootedPathsValid(fake)).toThrow(
      /depends on unknown field "a\.deep"/,
    );
  });

  it('merges composition children and skips non-shape members', () => {
    const fakeParent = {
      [COMPOSITION_CHILDREN]: [{ __schema: 42 }, enforce.isString()],
    };
    const fake = {
      __schema: { nested: fakeParent, probe: enforce.isString() },
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('nested'), prop('x')],
          target: [prop('probe')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(() => assertRuleRootedPathsValid(fake)).toThrow(
      /depends on unknown field "nested\.x"/,
    );
  });

  it('walks single item schemas against the member shape', () => {
    const fake = {
      __schema: {
        rows: enforce.isArrayOf(enforce.shape({ x: enforce.isString() })),
        probe: enforce.isString(),
      },
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('rows'), prop('x')],
          target: [prop('probe')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(assertRuleRootedPathsValid(fake)).toBeUndefined();
  });

  it('merges tuple member shapes and drops non-shape entries', () => {
    const fakeTup = { [ITEM_SCHEMA]: [{ __schema: 42 }] };
    const fake = {
      __schema: { pair: fakeTup, probe: enforce.isString() },
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('pair'), prop('x')],
          target: [prop('probe')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(() => assertRuleRootedPathsValid(fake)).toThrow(
      /depends on unknown field "pair\.x"/,
    );
  });

  it('resolves inline deps through property scopes to the containing shape', () => {
    const nested = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    });
    const rels = resolveInlineDeps(
      { b: depOn(() => fakeRef([prop('policy')])) },
      [prop('company')],
      {
        policy: enforce.isString(),
        company: nested,
      } as never,
    );
    expect(rels).toHaveLength(1);
    expect(rels[0].source).toHaveLength(1);
  });

  it('rebases scoped deps under a matching non-empty prefix', () => {
    const company = enforce.shape({
      b: enforce.isString(),
      c: enforce.isString(),
    });
    const rels = resolveInlineDeps(
      { c: depOn(() => fakeRef([prop('company'), prop('b')])) },
      [prop('company')],
      { company } as never,
    );
    expect(rels).toHaveLength(1);
    expect(rels[0]).not.toHaveProperty('__isRootSource');
  });

  it('stops scope descent at non-rule members', () => {
    const rels = resolveInlineDeps(
      { b: depOn(() => fakeRef([prop('a')])) },
      [prop('box')],
      { a: enforce.isString(), box: 42 } as never,
    );
    expect(rels).toHaveLength(1);
  });

  it('rejects scoped deps against scalar scope members', () => {
    expect(() =>
      resolveInlineDeps(
        { b: depOn(() => fakeRef([prop('box'), prop('a')])) },
        [prop('box')],
        { box: enforce.isString() } as never,
      ),
    ).toThrow(EnforceSchemaError);
  });

  it('descends item scopes into the member shape', () => {
    const rows = enforce.isArrayOf(
      enforce.shape({ country: enforce.isString() }),
    );
    const rels = resolveInlineDeps(
      {
        b: depOn(() =>
          fakeRef([prop('rows'), itemSeg('rows.$item'), prop('country')]),
        ),
      },
      [prop('rows'), itemSeg('rows.$item')],
      { rows } as never,
    );
    expect(rels).toHaveLength(1);
  });

  it('falls back to an empty shape for scalar item members', () => {
    const rows = enforce.isArrayOf(enforce.isString());
    expect(() =>
      resolveInlineDeps(
        {
          b: depOn(() =>
            fakeRef([prop('rows'), itemSeg('rows.$item'), prop('country')]),
          ),
        },
        [prop('rows'), itemSeg('rows.$item')],
        { rows } as never,
      ),
    ).toThrow(/depends on unknown field/);
  });

  it('supports scopes starting at an item segment or unknown kinds', () => {
    const rows = enforce.isArrayOf(
      enforce.shape({ country: enforce.isString() }),
    );
    const fromItem = resolveInlineDeps(
      { b: depOn(() => fakeRef([prop('policy')])) },
      [itemSeg('rows.$item')],
      { policy: enforce.isString(), rows } as never,
    );
    expect(fromItem).toHaveLength(1);
    const exotic = resolveInlineDeps(
      { b: depOn(() => fakeRef([prop('policy')])) },
      [{ type: 'weird' } as never],
      { policy: enforce.isString() } as never,
    );
    expect(exotic).toHaveLength(1);
  });

  it('skips item segments while walking scalar and parent shapes', () => {
    const rels = resolveInlineDeps(
      {
        b: depOn(() =>
          fakeRef([prop('policy'), itemSeg('policy.$item'), prop('leaf')]),
        ),
      },
      [prop('company')],
      {
        policy: enforce.shape({ leaf: enforce.isString() }),
        company: enforce.shape({ b: enforce.isString() }),
      } as never,
    );
    expect(rels).toHaveLength(1);
  });

  it('short-circuits equality on length and segment mismatches', () => {
    expect(() =>
      resolveInlineDeps(
        { a: depOn(() => fakeRef([prop('a'), prop('deep')])) },
        [],
        { a: enforce.isString() } as never,
      ),
    ).toThrow(/scalar field/);
    const rels = resolveInlineDeps(
      { b: depOn(() => fakeRef([prop('q'), prop('b')])) },
      [itemSeg('rows.$item')],
      {
        q: enforce.shape({ b: enforce.isString() }),
        b: enforce.isString(),
      } as never,
    );
    expect(rels).toHaveLength(1);
  });

  it('distinguishes item bindings and filters exact self edges', () => {
    const rels = resolveInlineDeps(
      { b: depOn(() => fakeRef([itemSeg('other'), prop('b')])) },
      [itemSeg('rows.$item')],
      { b: enforce.isString() } as never,
    );
    expect(rels).toHaveLength(1);
    const filtered = resolveInlineDeps(
      { b: depOn(() => fakeRef([itemSeg('rows.$item'), prop('b')])) },
      [itemSeg('rows.$item')],
      { b: enforce.isString() } as never,
    );
    expect(filtered).toHaveLength(0);
  });

  it('walks tuple members through merged item shapes', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(
        enforce.shape({ x: enforce.shape({ deep: enforce.isString() }) }),
      ),
      y: enforce.isString().dependsOn(($: any) => $.pair.x.deep),
    });
    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
  });

  it('walks array members through single item shapes', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({ x: enforce.shape({ deep: enforce.isString() }) }),
      ),
      y: enforce.isString().dependsOn(($: any) => $.rows.x.deep),
    });
    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
  });

  it('falls back to the parent shape for scalar record members', () => {
    expect(() =>
      enforce.shape({
        dict: enforce.record(enforce.isString()),
        y: enforce.isString().dependsOn(($: any) => $.dict.whatever),
      }),
    ).toThrow(/depends on unknown field "dict\.whatever"/);
  });

  it('rejects dangling paths through compositions without a merged shape', () => {
    const first = enforce.shape({
      p: enforce.isString(),
      q: enforce.isString().dependsOn($ => $.p),
    });
    const second = enforce.shape({ m: enforce.isString() });
    expect(() =>
      enforce.shape({
        block: compose(first, second),
        x: enforce.isString().dependsOn(($: any) => $.block.mid.leaf),
      }),
    ).toThrow(/depends on unknown field "block\.mid\.leaf"/);
  });

  it('suggests intermediate keys and stays silent on far misses', () => {
    expect(() =>
      enforce.shape({
        account: enforce.shape({ name: enforce.isString() }),
        x: enforce.isString().dependsOn(($: any) => $.acount.name),
      }),
    ).toThrow(/Did you mean "account"/);
    let message = '';
    try {
      enforce.shape({
        account: enforce.shape({ name: enforce.isString() }),
        x: enforce.isString().dependsOn(($: any) => $.zzz.name),
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/depends on unknown field "zzz\.name"/);
    expect(message).not.toMatch(/Did you mean/);
    let leafMessage = '';
    try {
      enforce.shape({
        password: enforce.isString(),
        confirm: enforce.isString().dependsOn(($: any) => $.zzzzzz),
      });
    } catch (error) {
      leafMessage = (error as Error).message;
    }
    expect(leafMessage).toMatch(/depends on unknown field "zzzzzz"/);
    expect(leafMessage).not.toMatch(/Did you mean/);
  });

  it('finalizes rooted references inside tuple members', () => {
    const ok = enforce.shape({
      policy: enforce.isString(),
      pair: enforce.tuple(
        enforce.shape({
          t: enforce.isString().dependsOn($ => ($.root as any).policy),
        }),
      ),
    });
    expect(() => assertSchemaRootPathsValid(ok)).not.toThrow();
    const bad = enforce.shape({
      policy: enforce.isString(),
      pair: enforce.tuple(
        enforce.shape({
          t: enforce.isString().dependsOn($ => ($.root as any).missing),
        }),
      ),
    });
    expect(() => assertSchemaRootPathsValid(bad)).toThrow(EnforceSchemaError);
  });

  it('covers finalizer containers: arrays, plain records, unknown roots', () => {
    const arraySchema = enforce.isString() as unknown as Record<
      string,
      unknown
    >;
    arraySchema.__schema = [enforce.isString()];
    expect(assertSchemaRootPathsValid(arraySchema as never)).toBeUndefined();
    const member = {
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('a')],
          target: [prop('b')],
          effect: 'invalidate',
        },
      ],
    };
    expect(assertSchemaRootPathsValid({ member } as never)).toBeUndefined();
    const orphan = {
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('a')],
          target: [prop('b')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(() => assertSchemaRootPathsValid(orphan)).toThrow(
      /depends on unknown field "a"/,
    );
    const nonObject = {
      __schema: { box: { __schema: 42 }, probe: enforce.isString() },
      [RESOLVED_RELATIONSHIPS]: [
        {
          source: [prop('box'), prop('leaf')],
          target: [prop('probe')],
          effect: 'invalidate',
          __isRootSource: true,
        },
      ],
    } as never;
    expect(() => assertSchemaRootPathsValid(nonObject)).toThrow(
      /depends on unknown field "box\.leaf"/,
    );
  });

  it('covers trailing item sources, deep scopes, and item endpoints', () => {
    // A source ending in an item segment returns before leaf checks.
    const trailing = resolveInlineDeps(
      { b: depOn(() => fakeRef([prop('a'), itemSeg('a.$item')])) },
      [],
      {
        a: enforce.shape({ x: enforce.isString() }),
        b: enforce.isString(),
      } as never,
    );
    expect(trailing).toHaveLength(1);
    // A prefix longer than the path can never prefix it.
    const nested = enforce.shape({
      sub: enforce.shape({ t: enforce.isString() }),
    });
    const rooted = resolveInlineDeps(
      { t: depOn(() => fakeRef([prop('policy')])) },
      [prop('company'), prop('sub')],
      { policy: enforce.isString(), company: nested } as never,
    );
    expect(rooted).toHaveLength(1);
    // Item scope descent merges tuple member shapes.
    const pair = enforce.tuple(enforce.shape({ x: enforce.isString() }));
    const merged = resolveInlineDeps(
      {
        b: depOn(() =>
          fakeRef([prop('pair'), itemSeg('pair.$item'), prop('x')]),
        ),
      },
      [prop('pair'), itemSeg('pair.$item')],
      { pair } as never,
    );
    expect(merged).toHaveLength(1);
    // Finalizer: item/empty endpoints resolve to "unknown", item sources skip.
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    }) as unknown as Record<symbol, unknown>;
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a')],
        target: [itemSeg('b')],
        effect: 'invalidate',
        __isRootSource: true,
      },
    ] as never;
    expect(assertSchemaRootPathsValid(schema as never)).toBeUndefined();
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a')],
        target: [],
        effect: 'invalidate',
        __isRootSource: true,
      },
    ] as never;
    expect(assertSchemaRootPathsValid(schema as never)).toBeUndefined();
    schema[RESOLVED_RELATIONSHIPS] = [
      {
        source: [prop('a'), itemSeg('a.$item')],
        target: [prop('b')],
        effect: 'invalidate',
        __isRootSource: true,
      },
    ] as never;
    expect(assertSchemaRootPathsValid(schema as never)).toBeUndefined();
  });
});

function prop(key: string) {
  return propertySegment(key);
}

function itemSeg(binding: string) {
  return { type: 'item', binding } as const;
}

function fakeRef(
  path: Array<ReturnType<typeof prop> | ReturnType<typeof itemSeg>>,
  isRoot = false,
) {
  return {
    [DEPENDENCY_REF]: true,
    [REF_PATH]: path,
    [REF_IS_ROOT]: isRoot,
  };
}

function depOn(resolver: (scope: unknown) => unknown) {
  const rule = enforce.isString() as unknown as Record<symbol, unknown>;
  rule[UNRESOLVED_DEPS] = [{ resolver }];
  return rule as never;
}

function dangling() {
  return enforce.isString().dependsOn(($: any) => $.missing);
}
