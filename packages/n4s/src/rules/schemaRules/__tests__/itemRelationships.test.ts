import { describe, it, expect } from 'vitest';

import { compose, enforce } from '../../../n4s';
import { EnforceSchemaError } from '../../../errors/EnforceSchemaError';
import { RESOLVED_RELATIONSHIPS } from '../../../schema/dependencyResolver';
import type { SchemaRelationship } from '../../../schema/SchemaRelationship';

type PathSegment = {
  type?: string;
  key?: unknown;
  binding?: unknown;
};

function pathString(path: unknown): string {
  return ((path ?? []) as PathSegment[])
    .map(seg => (seg.type === 'item' ? String(seg.binding) : String(seg.key)))
    .join('.');
}

function sourcesFor(
  described: { relationships: SchemaRelationship[] },
  target: string,
): string[] {
  return described.relationships
    .filter(rel => pathString(rel.target) === target)
    .map(rel => pathString(rel.source));
}

describe('item relationships', () => {
  it('tuple with an inner dependsOn describes the rebased edge', () => {
    const schema = enforce.shape({
      t: enforce.tuple(
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });

    expect(sourcesFor(schema.describe(), 't.t.$item.state')).toEqual([
      't.t.$item.country',
    ]);
  });

  it('tuple collects edges from every graph-carrying element', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
        enforce.shape({
          city: enforce.isString(),
          zip: enforce.isString().dependsOn($ => $.city),
        }),
      ),
    });

    const described = schema.describe();
    expect(sourcesFor(described, 'pair.pair.$item.state')).toEqual([
      'pair.pair.$item.country',
    ]);
    expect(sourcesFor(described, 'pair.pair.$item.zip')).toEqual([
      'pair.pair.$item.city',
    ]);
  });

  it('record with an inner dependsOn describes the rebased edge', () => {
    const schema = enforce.shape({
      d: enforce.record(
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });

    expect(sourcesFor(schema.describe(), 'd.d.$item.state')).toEqual([
      'd.d.$item.country',
    ]);
  });

  it('record with a key rule still describes the value rule edge', () => {
    const schema = enforce.shape({
      d: enforce.record(
        enforce.isString(),
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });

    expect(sourcesFor(schema.describe(), 'd.d.$item.state')).toEqual([
      'd.d.$item.country',
    ]);
  });

  it('multi-rule isArrayOf describes the union of member edges', () => {
    // Union semantics: an element may match ANY member rule, so the item
    // graph is the union of member graphs (over-approximating, never empty).
    const schema = enforce.shape({
      items: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          kind: enforce.isString().dependsOn($ => $.country),
        }),
        enforce.isString(),
      ),
    });

    expect(sourcesFor(schema.describe(), 'items.items.$item.kind')).toEqual([
      'items.items.$item.country',
    ]);
  });

  it('single-rule isArrayOf keeps describing its edge', () => {
    const schema = enforce.shape({
      items: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          kind: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });

    expect(sourcesFor(schema.describe(), 'items.items.$item.kind')).toEqual([
      'items.items.$item.country',
    ]);
  });

  it('doubly nested isArrayOf describes the inner edge', () => {
    // The item graph lives two ITEM_SCHEMA hops down; describe() must
    // recurse instead of dropping it (each level appends an item segment).
    const schema = enforce.shape({
      m: enforce.isArrayOf(
        enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce.isString().dependsOn($ => $.country),
          }),
        ),
      ),
    });

    expect(
      sourcesFor(schema.describe(), 'm.m.$item.m.$item.$item.state'),
    ).toEqual(['m.m.$item.m.$item.$item.country']);
  });

  it('diamond members emit both the direct and the nested edge', () => {
    // isArrayOf(mid, inner) with mid = isArrayOf(inner) reaches `inner`
    // under two prefixes. A shared visited-set would swallow the second
    // occurrence (under-invalidation); only the current descent path is
    // guarded, so both edges surface.
    const inner = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      m: enforce.isArrayOf(enforce.isArrayOf(inner), inner),
    });

    expect(sourcesFor(schema.describe(), 'm.m.$item.state')).toEqual([
      'm.m.$item.country',
    ]);
    expect(
      sourcesFor(schema.describe(), 'm.m.$item.m.$item.$item.state'),
    ).toEqual(['m.m.$item.m.$item.$item.country']);
  });

  it('converging diamonds emit one edge, not 2^d copies', () => {
    // The same member reachable via several same-depth paths (here via
    // both `a` and `b`) yields byte-identical edges; describe() keeps one.
    const inner = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      m: enforce.isArrayOf(enforce.isArrayOf(inner), enforce.isArrayOf(inner)),
    });

    const described = schema.describe();
    expect(described.relationships).toHaveLength(1);
    expect(sourcesFor(described, 'm.m.$item.m.$item.$item.state')).toEqual([
      'm.m.$item.m.$item.$item.country',
    ]);
  });

  it('multi-rule array with a nested container member keeps the edge', () => {
    // Container members (no __schema of their own) must survive the
    // member filter so recursion can reach the graph inside them.
    const schema = enforce.shape({
      m: enforce.isArrayOf(
        enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce.isString().dependsOn($ => $.country),
          }),
        ),
        enforce.isString(),
      ),
    });

    expect(
      sourcesFor(schema.describe(), 'm.m.$item.m.$item.$item.state'),
    ).toEqual(['m.m.$item.m.$item.$item.country']);
  });

  it('record of arrays describes the inner edge', () => {
    const schema = enforce.shape({
      d: enforce.record(
        enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce.isString().dependsOn($ => $.country),
          }),
        ),
      ),
    });

    expect(
      sourcesFor(schema.describe(), 'd.d.$item.d.$item.$item.state'),
    ).toEqual(['d.d.$item.d.$item.$item.country']);
  });

  it('composed graph-carrying rule keeps its edge when mounted', () => {
    // compose() of a single composite forwards the schema slots, so the
    // composed rule describes exactly like the rule it wraps.
    const inner = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({ name: compose(inner) });

    expect(
      schema
        .describe()
        .relationships.filter(rel => pathString(rel.target) === 'name.state'),
    ).toHaveLength(1);
  });

  it('composed array rule keeps its item edge when mounted', () => {
    const schema = enforce.shape({
      m: compose(
        enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce.isString().dependsOn($ => $.country),
          }),
        ),
      ),
    });

    expect(sourcesFor(schema.describe(), 'm.m.$item.state')).toEqual([
      'm.m.$item.country',
    ]);
  });

  it('non-invalidate effects throw the deferred-to-v2 error at composition', () => {
    // No public API produces a 'revalidate' effect in V1 — every resolver
    // emits 'invalidate'. The planted slot below pins the composition-time
    // V1 boundary so a future effect value cannot slip through silently.
    const inner = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const slots = inner as unknown as Record<symbol, unknown>;
    const rels = slots[RESOLVED_RELATIONSHIPS] as Array<
      Record<string, unknown>
    >;
    slots[RESOLVED_RELATIONSHIPS] = [
      ...rels,
      { ...rels[0], effect: 'revalidate' },
    ];
    expect(() => enforce.shape({ m: enforce.isArrayOf(inner) })).toThrow(
      /deferred to v2/,
    );
  });
});

describe('dotted dependsOn with a missing intermediate', () => {
  it('throws EnforceSchemaError naming the missing segment', () => {
    let caught: unknown;
    try {
      enforce.shape({
        x: enforce.isString().dependsOn($ => $.a.b),
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(EnforceSchemaError);
    expect((caught as Error).message).toMatch(
      /EnforceSchemaError: "x" depends on unknown field "a"/,
    );
  });

  it('names a missing nested intermediate rather than crashing', () => {
    let caught: unknown;
    try {
      enforce.shape({
        x: enforce.isString().dependsOn($ => $.a.b.c),
        a: enforce.shape({
          z: enforce.isString(),
        }),
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(EnforceSchemaError);
    expect((caught as Error).message).toMatch(
      /EnforceSchemaError: "x" depends on unknown field "b"/,
    );
  });
});
