import { describe, expect, it, vi } from 'vitest';
import { SchemaExclusionError, enforce } from 'n4s';

import { create, test } from '../../vest';

// DO02: executable rejection tests for every declared-unsupported
// exclusion. Record-descending skips and opaque moved-chain skips reject
// with SchemaExclusionError (SCHEMA_EXCLUSION_UNSUPPORTED) before any
// excluded predicate runs and before any suite callback publishes.
function recordSuite() {
  const aCalls: unknown[] = [];
  const bCalls: unknown[] = [];
  const callbacks: unknown[] = [];
  const suite = create(
    data => {
      callbacks.push(data);
      test('note', () => true);
    },
    enforce.shape({
      dict: enforce.record(
        enforce.shape({
          a: enforce.condition((value: unknown) => {
            aCalls.push(value);
            return true;
          }),
          b: enforce.condition((value: unknown) => {
            bCalls.push(value);
            return true;
          }),
        }),
      ),
      note: enforce.isString(),
    }) as never,
  );
  const data = () => ({
    dict: { k1: { a: 'a1', b: 'b1' }, k2: { a: 'a2', b: 'b2' } },
    note: 'ok',
  });
  return { aCalls, bCalls, callbacks, data, suite };
}

function movedSuite(skipped: ReturnType<typeof vi.fn>) {
  const moved = (
    enforce.shape({
      a: enforce.condition(skipped),
      b: enforce.isString(),
    }) as unknown as { message(m: string): unknown }
  ).message('moved container');
  const callback = vi.fn();
  const suite = create(data => {
    callback(data);
  }, moved as never);
  return { callback, suite };
}

describe('schema contracts: unsupported exclusions fail closed (DO02)', () => {
  it.each(['changed-then-skip', 'skip-then-changed'] as const)(
    '[SC-DO02] record-descending skip %s rejects with zero predicate calls',
    order => {
      const { aCalls, bCalls, callbacks, data, suite } = recordSuite();
      let thrown: unknown;
      try {
        if (order === 'changed-then-skip')
          suite.changed('dict.k1.b').focus({ skip: 'dict.k1.a' }).run(data());
        else
          suite.focus({ skip: 'dict.k1.a' }).changed('dict.k1.b').run(data());
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(SchemaExclusionError);
      expect((thrown as SchemaExclusionError).code).toBe(
        'SCHEMA_EXCLUSION_UNSUPPORTED',
      );
      expect(aCalls).toEqual([]);
      expect(bCalls).toEqual([]);
      expect(callbacks).toEqual([]);
    },
  );

  it('[SC-DO02] whole-key record skip on a skip-only run rejects with zero predicate calls', () => {
    const { aCalls, bCalls, callbacks, data, suite } = recordSuite();
    let thrown: unknown;
    try {
      suite.focus({ skip: 'dict.k1' }).run(data());
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SchemaExclusionError);
    expect((thrown as SchemaExclusionError).code).toBe(
      'SCHEMA_EXCLUSION_UNSUPPORTED',
    );
    expect(aCalls).toEqual([]);
    expect(bCalls).toEqual([]);
    expect(callbacks).toEqual([]);
  });

  it.each(['changed-then-skip', 'skip-then-changed'] as const)(
    '[SC-DO02] opaque moved-chain skip %s rejects with zero predicate calls',
    order => {
      const skipped = vi.fn(() => true);
      const { callback, suite } = movedSuite(skipped);
      const runner = suite as unknown as {
        changed(field: string): {
          focus(modifiers: { skip: string }): { run(data: unknown): unknown };
        };
        focus(modifiers: { skip: string }): {
          changed(field: string): { run(data: unknown): unknown };
        };
      };
      let thrown: unknown;
      try {
        if (order === 'changed-then-skip')
          runner.changed('b').focus({ skip: 'a' }).run({ a: 'a', b: 'b' });
        else runner.focus({ skip: 'a' }).changed('b').run({ a: 'a', b: 'b' });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(SchemaExclusionError);
      expect((thrown as SchemaExclusionError).code).toBe(
        'SCHEMA_EXCLUSION_UNSUPPORTED',
      );
      expect(skipped).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    },
  );
});
