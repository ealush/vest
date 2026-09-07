/* eslint-disable vitest/valid-expect -- expectTypeOf(...).returns chains lock the public type */
import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  DescribeResult,
  ItemSegment,
  PropertySegment,
  SchemaDependency,
  SchemaPath,
  SchemaRelationship,
} from '../n4s';
import { enforce } from '../n4s';
import type { InternalRelationship } from '../schema/SchemaRelationship';
import { RuleInstance } from '../utils/RuleInstance';
import { RuleRunReturn } from '../utils/RuleRunReturn';

const RESOLVED = Symbol.for('vest:resolvedRelationships');

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

function liveGraph(schema: unknown): InternalRelationship[] {
  return (schema as Record<symbol, unknown>)[
    RESOLVED
  ] as InternalRelationship[];
}

function sourceKey(schema: unknown): unknown {
  const [rel] = liveGraph(schema);
  const [seg] = rel.source as Mutable<SchemaPath>;
  return (seg as Mutable<PropertySegment>).key;
}

describe('describe() isolation', () => {
  it('locks the DescribeResult public shape', () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
    });
    expectTypeOf(schema.describe).returns.toEqualTypeOf<DescribeResult>();
    const desc = schema.describe();
    expectTypeOf(desc.dependencies).toEqualTypeOf<SchemaDependency[]>();
    expectTypeOf(desc.relationships).toEqualTypeOf<SchemaRelationship[]>();
  });

  it('chainBuilder: mutating describe() output leaves the live graph intact', () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
    });

    const snap = schema.describe();
    expect(snap.relationships).toHaveLength(1);
    // No internal flags leak into public output
    expect(snap.relationships[0]).not.toHaveProperty('__isRootSource');
    expect(snap.relationships[0]).not.toHaveProperty('__isRootTarget');

    // P1 reproducer: poison the public snapshot
    const seg = snap.relationships[0].source[0] as Mutable<PropertySegment>;
    seg.key = 'attacker';
    (snap.relationships[0].source as unknown[]).push({
      type: 'property',
      key: 'extra',
    });
    (snap.dependencies[0].sources[0] as unknown[]).push({
      type: 'property',
      key: 'extra',
    });

    // Live graph (the same array suite.changed() reads) is unaffected,
    // so a later suite.changed('password') still matches confirm's source.
    expect(sourceKey(schema)).toBe('password');
    expect(liveGraph(schema)[0].source).toHaveLength(1);
    expect(liveGraph(schema)[0].target).toHaveLength(1);

    // A fresh describe() is unaffected too
    const fresh = schema.describe();
    expect((fresh.relationships[0].source[0] as PropertySegment).key).toBe(
      'password',
    );
    expect(fresh.relationships[0].source).toHaveLength(1);
    expect((fresh.dependencies[0].sources[0][0] as PropertySegment).key).toBe(
      'password',
    );
  });

  it('chainBuilder: separate describe() calls share no references', () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
    });
    const a = schema.describe();
    const b = schema.describe();
    expect(a.relationships[0]).not.toBe(b.relationships[0]);
    expect(a.relationships[0].source).not.toBe(b.relationships[0].source);
    expect(a.relationships[0].source[0]).not.toBe(b.relationships[0].source[0]);
    expect(a.relationships[0].target).not.toBe(b.relationships[0].target);
    expect(a.dependencies[0]).not.toBe(b.dependencies[0]);
    expect(a.dependencies[0].target).not.toBe(b.dependencies[0].target);
    expect(a.dependencies[0].sources[0]).not.toBe(b.dependencies[0].sources[0]);
    // dependencies and relationships outputs are independent of each other
    expect(a.dependencies[0].target).not.toBe(a.relationships[0].target);
    expect(a.dependencies[0].sources[0]).not.toBe(a.relationships[0].source);
  });

  it('RuleInstance.create: mutating describe() output leaves the live graph intact', () => {
    type R = RuleInstance<string, [string]>;
    const rule = RuleInstance.create<R, string, [string]>(value =>
      RuleRunReturn.Passing(value),
    );
    (rule as unknown as Record<symbol, unknown>)[RESOLVED] = [
      {
        __isRootSource: true,
        effect: 'invalidate',
        metadata: { reason: 'test' },
        source: [{ type: 'property', key: 'password' }],
        target: [{ type: 'property', key: 'confirm' }],
      } satisfies InternalRelationship,
    ];

    const snap = rule.describe();
    expect(snap.relationships).toHaveLength(1);
    expect(snap.relationships[0]).not.toHaveProperty('__isRootSource');
    expect(snap.relationships[0]).toEqual({
      effect: 'invalidate',
      metadata: { reason: 'test' },
      source: [{ type: 'property', key: 'password' }],
      target: [{ type: 'property', key: 'confirm' }],
    });

    (snap.relationships[0].source[0] as Mutable<PropertySegment>).key =
      'attacker';
    (snap.relationships[0].metadata as Mutable<{ reason?: string }>).reason =
      'poisoned';
    (snap.dependencies[0].target[0] as Mutable<PropertySegment>).key =
      'attacker';

    expect(sourceKey(rule)).toBe('password');
    const fresh = rule.describe();
    expect((fresh.relationships[0].source[0] as PropertySegment).key).toBe(
      'password',
    );
    expect(fresh.relationships[0].metadata).toEqual({ reason: 'test' });
    expect((fresh.dependencies[0].target[0] as PropertySegment).key).toBe(
      'confirm',
    );
  });

  it('segment types are exported from the entry', () => {
    const prop: PropertySegment = { type: 'property', key: 'password' };
    const item: ItemSegment = { type: 'item', binding: 'travelers.$item' };
    const path: SchemaPath = [prop, item];
    expect(path).toHaveLength(2);
  });
});
