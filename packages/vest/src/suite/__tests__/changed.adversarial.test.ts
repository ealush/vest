import { describe, expect, it, vi } from 'vitest';
import { compose, enforce } from 'n4s';
import { resolveAffectedPaths, runSchemaPaths } from 'n4s/exports/internal';

import { create, test } from '../../vest';
import { cloneDataTree } from '../cloneDataTree';

describe('adversarial relationship contracts', () => {
  it('does not retry a failing validator and change its verdict', () => {
    const predicate = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const schema = enforce.shape({ a: enforce.condition(predicate) });
    const results = runSchemaPaths(schema, { a: 1 }, { affected: ['a'] });
    expect(results.some(result => !result.pass)).toBe(true);
    expect(predicate).toHaveBeenCalledTimes(1);
  });

  it('reports a root container failure during a changed run', () => {
    const schema = compose(
      enforce.shape({ a: enforce.isString() }),
      enforce.condition(() => false),
    );
    const suite = create(() => {}, schema);
    expect(suite.changed('a').run({ a: 'ok' }).hasErrors()).toBe(true);
  });

  it('reports descendant schema failures when changing a whole object', () => {
    const schema = enforce.shape({
      profile: enforce.shape({ name: enforce.isString().isNotBlank() }),
    });
    const suite = create(() => {}, schema);
    expect(
      suite
        .changed('profile')
        .run({ profile: { name: '' } })
        .hasErrors('profile.name'),
    ).toBe(true);
  });

  it('invalidates an object dependency when a descendant value changes', () => {
    const schema = enforce.shape({
      profile: enforce.shape({ name: enforce.isString() }),
      display: enforce.isString().dependsOn($ => $.profile),
    });
    expect(resolveAffectedPaths(schema, ['profile.name'])).toContain('display');
  });

  it('reads relationships from a callable composed root schema', () => {
    const schema = compose(
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      }),
    );
    expect(resolveAffectedPaths(schema, ['a'])).toEqual(['a', 'b']);
  });

  it('does not suppress composition checks inside a user validator', () => {
    const schema = enforce.shape({
      a: enforce.condition(() => {
        enforce.shape({ x: enforce.isString().dependsOn($ => $.missing) });
        return true;
      }),
    });
    expect(
      runSchemaPaths(schema, { a: 1 }, { affected: ['a'] }).some(
        result => !result.pass,
      ),
    ).toBe(true);
  });

  it('preserves untouched schema failures across changed runs', () => {
    const schema = enforce.shape({
      a: enforce.isString().isNotBlank(),
      b: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    expect(suite.run({ a: '', b: 'ok' }).hasErrors('a')).toBe(true);
    expect(suite.changed('b').run({ a: '', b: 'next' }).hasErrors('a')).toBe(
      true,
    );
  });

  it('does not execute skipped schema predicates on changed runs', () => {
    const skipped = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(skipped),
      b: enforce.isString(),
    });
    create(() => {}, schema)
      .changed('a')
      .focus({ skip: 'a' })
      .run({ a: 1, b: 'ok' });
    expect(skipped).not.toHaveBeenCalled();
  });

  it('does not execute a nested skipped schema predicate during composed fallback', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        profile: enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }),
      }),
      enforce.condition(() => true),
    );

    create(() => {}, schema)
      .changed('profile.b')
      .focus({ skip: 'profile.a' })
      .run({ profile: { a: 'a', b: 'b' } });

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('does not expose the mutable Map behind a snapshot through forEach', () => {
    const snapshot = cloneDataTree(new Map([['key', 1]]), true) as Map<
      string,
      number
    >;
    expect(() =>
      snapshot.forEach((_value, _key, map) => map.set('key', 2)),
    ).toThrow();
    expect(snapshot.get('key')).toBe(1);
  });

  it('does not expose the mutable Map behind a snapshot through valueOf', () => {
    const snapshot = cloneDataTree(new Map([['key', 1]]), true) as Map<
      string,
      number
    >;
    expect(snapshot.valueOf()).toBe(snapshot);
  });

  it('does not retain a deleted optional property as an own undefined property', () => {
    const received: unknown[] = [];
    const schema = enforce.partial({
      optional: enforce.isString(),
      other: enforce.isString(),
    });
    const suite = create(data => {
      received.push(data);
      test('other', () => true);
    }, schema);
    suite.run({ optional: 'present', other: 'ok' });
    suite.changed('optional').run({ other: 'ok' });
    expect(Object.hasOwn(received[1] as object, 'optional')).toBe(false);
  });

  it('exposes the complete mapped output through result.value', () => {
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });
    const suite = create(() => {
      test('note', () => true);
    }, schema);
    suite.run({ age: '42', note: 'first' });
    const result = suite.changed('note').run({ age: '42', note: 'second' });
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ age: 42, note: 'second' });
  });

  it('keeps untouched array members mapped after a focused item change', () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isNumeric().toNumber()),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema);
    suite.run({ rows: ['1', '2'] });
    suite.changed('rows.0').run({ rows: ['3', '2'] });
    expect(seen[1]).toEqual({ rows: [3, 2] });
  });

  it.each(['resetField', 'remove'] as const)(
    'respects %s before retaining schema errors',
    operation => {
      const schema = enforce.shape({
        a: enforce.isString().isNotBlank(),
        b: enforce.isString(),
      });
      const suite = create(() => {}, schema);
      suite.run({ a: '', b: 'ok' });
      suite[operation]('a');
      expect(suite.changed('b').run({ a: '', b: 'next' }).hasErrors('a')).toBe(
        false,
      );
    },
  );

  it('clears a retained schema error when the field is fixed', () => {
    const schema = enforce.shape({
      a: enforce.isString().isNotBlank(),
      b: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    suite.run({ a: '', b: 'ok' });
    suite.changed('b').run({ a: '', b: 'next' });
    expect(
      suite.changed('a').run({ a: 'fixed', b: 'next' }).hasErrors('a'),
    ).toBe(false);
  });

  it('retains schema failures from a resumed test tree', () => {
    const schema = enforce.shape({
      a: enforce.isString().isNotBlank(),
      b: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    suite.run({ a: '', b: 'ok' });
    const resumed = create(() => {}, schema);
    resumed.resume(suite.dump());
    expect(resumed.changed('b').run({ a: '', b: 'next' }).hasErrors('a')).toBe(
      true,
    );
  });

  it('does not resurrect errors after resetting a suite', () => {
    const schema = enforce.shape({
      a: enforce.isString().isNotBlank(),
      b: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    suite.run({ a: '', b: 'ok' });
    suite.reset();
    expect(suite.changed('b').run({ a: '', b: 'next' }).hasErrors('a')).toBe(
      false,
    );
  });

  it('keeps schema failure attribution from widening user test selection', () => {
    const parent = vi.fn(() => {});
    const schema = compose(
      enforce.shape({ a: enforce.isString() }),
      enforce.condition(() => false),
    );
    const suite = create(() => {
      test('__root__', parent);
    }, schema);
    expect(suite.changed('a').run({ a: 'ok' }).hasErrors()).toBe(true);
    expect(parent).not.toHaveBeenCalled();
  });

  it('preserves Set forEach receiver and immutable collection arguments', () => {
    const snapshot = cloneDataTree(new Set([1]), true) as Set<number>;
    const receiver = {};
    snapshot.forEach(function (this: unknown, value, key, set) {
      expect(this).toBe(receiver);
      expect(value).toBe(key);
      expect(set).toBe(snapshot);
      expect(() => set.clear()).toThrow(TypeError);
    }, receiver);
    expect([...snapshot]).toEqual([1]);
  });

  it('rejects invalid forEach callbacks even on empty snapshot collections', () => {
    const snapshot = cloneDataTree(new Map(), true) as Map<string, number>;
    expect(() => Reflect.apply(snapshot.forEach, snapshot, [null])).toThrow(
      TypeError,
    );
  });
});
