import { describe, expect, it, vi } from 'vitest';
import { SchemaExclusionError, enforce } from 'n4s';

import { create, group, mode, Modes, test } from '../../vest';

// AP01b: builder reuse cannot accumulate stale focus. A derived builder is a
// snapshot: running it twice repeats the same selection, forking two
// builders from one parent keeps each fork independent, changed/only/skip
// agree in both orders, the parent stays unchanged, and a failed run does
// not consume the builder configuration.
function reuseSchema() {
  const pa = vi.fn(() => true);
  const pb = vi.fn(() => true);
  return {
    pa,
    pb,
    schema: enforce.shape({
      a: enforce.condition(pa),
      b: enforce.condition(pb),
    }),
  };
}

function reuseSuite() {
  const { pa, pb, schema } = reuseSchema();
  const calls: string[] = [];
  const suite = create((_data: unknown) => {
    mode(Modes.ALL);
    test('a', () => {
      calls.push('a');
      return true;
    });
    test('b', () => {
      calls.push('b');
      return true;
    });
  }, schema);
  return { suite, pa, pb, calls };
}

describe('schema contracts: builder reuse does not accumulate focus (AP01b)', () => {
  it('[SC-AP01b] one builder run twice repeats the same selection', () => {
    const { suite, pa, pb, calls } = reuseSuite();
    const builder = suite.changed('a');
    const data = { a: 'x', b: 'y' };

    builder.run(data);
    expect(calls).toEqual(['a']);
    expect(pa).toHaveBeenCalledTimes(1);
    expect(pb).not.toHaveBeenCalled();

    calls.length = 0;
    pa.mockClear();
    pb.mockClear();
    builder.run(data);
    expect(calls).toEqual(['a']);
    expect(pa).toHaveBeenCalledTimes(1);
    expect(pb).not.toHaveBeenCalled();
  });

  it('[SC-AP01b] forking two builders from one parent keeps each fork independent', () => {
    const { suite, pa, pb, calls } = reuseSuite();
    const parent = suite.changed('a');
    const skipFork = parent.focus({ skip: 'a' });
    const data = { a: 'x', b: 'y' };

    // The skip fork selects nothing (a changed but skipped).
    pa.mockClear();
    pb.mockClear();
    calls.length = 0;
    const skipped = skipFork.run(data);
    expect(skipped.hasErrors('a')).toBe(false);
    expect(pa).not.toHaveBeenCalled();
    expect(calls).toEqual([]);

    // The parent still selects a.
    pa.mockClear();
    pb.mockClear();
    calls.length = 0;
    const repaired = parent.run(data);
    expect(repaired.hasErrors()).toBe(false);
    expect(pa).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['a']);
  });

  it('[SC-AP01b] changed/only/skip agree in both orders', () => {
    for (const order of ['changed-then-skip', 'skip-then-changed'] as const) {
      const { suite, pa, pb } = reuseSuite();
      const data = { a: 'x', b: 'y' };
      const result =
        order === 'changed-then-skip'
          ? suite.changed('b').focus({ skip: 'a' }).run(data)
          : suite.focus({ skip: 'a' }).changed('b').run(data);
      expect(result.hasErrors()).toBe(false);
      expect(pa).not.toHaveBeenCalled();
      expect(pb).toHaveBeenCalledTimes(1);
    }
    for (const order of ['changed-then-only', 'only-then-changed'] as const) {
      const { suite, pa, pb } = reuseSuite();
      const data = { a: 'x', b: 'y' };
      const result =
        order === 'changed-then-only'
          ? suite.changed('b').focus({ only: 'b' }).run(data)
          : suite.focus({ only: 'b' }).changed('b').run(data);
      expect(result.hasErrors()).toBe(false);
      expect(pa).not.toHaveBeenCalled();
      expect(pb).toHaveBeenCalledTimes(1);
    }
  });

  it('[SC-AP01b] deriving a child does not mutate the parent selection', () => {
    const { suite, pa, pb, calls } = reuseSuite();
    const parent = suite.changed('b');
    // Derive but do not run: the parent must be unaffected.
    parent.focus({ skip: 'b' });
    parent.only('a');

    pa.mockClear();
    pb.mockClear();
    calls.length = 0;
    parent.run({ a: 'x', b: 'y' });
    expect(pb).toHaveBeenCalledTimes(1);
    expect(pa).not.toHaveBeenCalled();
    expect(calls).toEqual(['b']);
  });

  it('[SC-AP01b] a failed run does not consume the builder configuration', () => {
    const skipped = vi.fn(() => true);
    const moved = (
      enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.isString(),
      }) as unknown as { message(m: string): unknown }
    ).message('moved container');
    const suite = create((_data: unknown) => {}, moved as never);
    const builder = suite.changed('b').focus({ skip: 'a' }) as unknown as {
      run(data: unknown): unknown;
    };

    let thrown: unknown;
    try {
      builder.run({ a: 'a', b: 'b' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SchemaExclusionError);
    expect(skipped).not.toHaveBeenCalled();

    // The same builder still rejects the same way (configuration retained),
    // and a fresh builder over a supported schema still validates.
    thrown = undefined;
    try {
      builder.run({ a: 'a', b: 'b' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SchemaExclusionError);

    const { suite: plain } = reuseSuite();
    const valid = plain.changed('b').run({ a: 'x', b: 'y' });
    expect(valid.hasErrors()).toBe(false);
  });
});

describe('schema contracts: builder snapshots caller configuration (AC04)', () => {
  function groupSuite() {
    const calls: string[] = [];
    const suite = create(
      () => {
        group('g1', () => test('a', () => void calls.push('a')));
        group('g2', () => test('b', () => void calls.push('b')));
      },
      enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
    );
    return { calls, suite };
  }

  it('[SC-AC04] mutating a group array after focus does not reselect derived builders', () => {
    const { calls, suite } = groupSuite();
    const groups = ['g1'];
    const parent = suite.focus({ onlyGroup: groups }) as any;
    groups[0] = 'g2';
    const child = parent.changed(['a', 'b']);
    parent.run({ a: 'a', b: 'b' });
    expect(calls).toEqual(['a']);
    calls.length = 0;
    child.run({ a: 'a', b: 'b' });
    expect(calls).toEqual(['a']);
  });

  it('[SC-AC04] mutating only/skip arrays after focus does not reselect', () => {
    const { suite } = reuseSuite();
    const only = ['a'];
    const skip: string[] = [];
    const parent = suite.focus({ only, skip } as never) as any;
    only.push('b');
    skip.push('a');
    const data = { a: 'x', b: 'y' };
    const result = parent.run(data);
    expect(result.hasErrors('b')).toBe(false);
    expect(result.hasErrors('a')).toBe(false);
  });

  it('[SC-AC04] skipGroup arrays are snapshotted at the boundary', () => {
    const { calls, suite } = groupSuite();
    const groups = ['g1'];
    const builder = suite.focus({ skipGroup: groups }) as any;
    groups.push('g2');
    builder.run({ a: 'a', b: 'b' });
    // Snapshot kept ['g1']: g1 skipped, g2 runs.
    expect(calls).toEqual(['b']);
  });

  it('[SC-AC04] reorder and clear after derivation keep the snapshot', () => {
    const { calls, suite } = groupSuite();
    const groups = ['g1', 'g2'];
    const builder = suite.focus({ onlyGroup: groups }) as any;
    groups.reverse();
    groups.length = 0;
    builder.run({ a: 'a', b: 'b' });
    expect(calls.sort()).toEqual(['a', 'b']);
  });

  it('[SC-AC04] caller arrays are never frozen or mutated', () => {
    const { suite } = reuseSuite();
    const only = ['a'];
    const groups = ['g1'];
    suite.focus({ only, onlyGroup: groups } as never);
    expect(Object.isFrozen(only)).toBe(false);
    expect(Object.isFrozen(groups)).toBe(false);
    expect(only).toEqual(['a']);
    expect(groups).toEqual(['g1']);
  });

  it('[SC-AC04] frozen arrays are accepted and snapshotted without mutation', () => {
    const { calls, suite } = groupSuite();
    const groups = Object.freeze(['g1']);
    const builder = suite.focus({ onlyGroup: groups }) as any;
    builder.run({ a: 'a', b: 'b' });
    expect(calls).toEqual(['a']);
    expect(groups).toEqual(['g1']);
  });

  it('[SC-AC04] readonly changed lists execute and stay untouched', () => {
    const { calls, suite } = groupSuite();
    const fields: readonly string[] = ['a', 'b'];
    const builder = suite.changed(fields) as any;
    builder.run({ a: 'a', b: 'b' });
    expect(calls.sort()).toEqual(['a', 'b']);
    expect(fields).toEqual(['a', 'b']);
  });
});
