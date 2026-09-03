import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';
import { EnforceSchemaError } from '../../../errors/EnforceSchemaError';
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
