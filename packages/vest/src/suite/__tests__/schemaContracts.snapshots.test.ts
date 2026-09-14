import { describe, expect, it, vi } from 'vitest';
import { enforce } from 'n4s';

import { create, test } from '../../vest';
import { cloneDataTree } from '../cloneDataTree';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      snapshotCounted: (value: string) => { pass: boolean; type: unknown };
    }
  }
}

const snapshotCounts = { parserRuns: 0, getterReads: 0 };
enforce.extend(
  {
    snapshotCounted: (value: string) => {
      snapshotCounts.parserRuns += 1;
      const carrier: Record<string, unknown> = {};
      Object.defineProperty(carrier, 'val', {
        enumerable: true,
        get: () => {
          snapshotCounts.getterReads += 1;
          return `fixed:${value}`;
        },
      });
      return { pass: true, type: carrier };
    },
  },
  { parsers: ['snapshotCounted'] },
);

function snapshotSchema() {
  return enforce.shape({
    doc: enforce.isString().snapshotCounted(),
    note: enforce.isString(),
  });
}

describe('schema contracts: ownership and snapshot boundaries', () => {
  it.each([false, true])(
    '[SC-ALIAS] shared buffer views preserve aliasing and offsets in detached copies (immutable=%s)',
    immutable => {
      const buffer = new ArrayBuffer(8);
      const input = {
        buffer,
        bytes: new Uint8Array(buffer, 2, 4),
        view: new DataView(buffer, 3, 2),
      };
      input.bytes[1] = 7;
      const copy = cloneDataTree(input, immutable) as typeof input;
      expect(copy.buffer).not.toBe(buffer);
      expect(copy.bytes.buffer).toBe(copy.buffer);
      expect(copy.view.buffer).toBe(copy.buffer);
      expect(copy.bytes.byteOffset).toBe(2);
      expect(copy.view.byteOffset).toBe(3);
      expect(copy.bytes.byteLength).toBe(4);
      expect(copy.view.getUint8(0)).toBe(7);
      copy.bytes[1] = 9;
      expect(copy.view.getUint8(0)).toBe(9);
      expect(input.view.getUint8(0)).toBe(7);
    },
  );

  it('[SC-ACCESSOR] reads an immutable snapshot getter once and detaches its live return value', () => {
    const live = { n: 1 };
    const getter = vi.fn(() => live);
    const input = Object.defineProperty({}, 'nested', {
      get: getter,
      enumerable: true,
    });
    const copy = cloneDataTree(input, true) as { nested: { n: number } };
    expect(getter).toHaveBeenCalledTimes(1);
    expect(copy.nested).not.toBe(live);
    copy.nested.n = 2;
    expect(live.n).toBe(1);
    expect(copy.nested.n).toBe(2);
    expect(getter).toHaveBeenCalledTimes(1);
  });

  it('[SC-ACCESSOR] a throwing snapshot getter fails explicitly instead of retaining a live closure', () => {
    const error = new Error('cannot snapshot');
    const getter = vi.fn(() => {
      throw error;
    });
    const input = Object.defineProperty({}, 'nested', {
      get: getter,
      enumerable: true,
    });
    expect(() => cloneDataTree(input, true)).toThrow(error);
    expect(getter).toHaveBeenCalledTimes(1);
  });

  it('[SC-ACCESSOR] a snapshot cannot call a foreign setter-only property', () => {
    const setter = vi.fn();
    const input = Object.defineProperty({}, 'secret', {
      set: setter,
      enumerable: true,
    });
    const copy = cloneDataTree(input, true) as { secret?: number };
    expect(copy.secret).toBeUndefined();
    expect(() => {
      copy.secret = 2;
    }).toThrow(TypeError);
    expect(setter).not.toHaveBeenCalled();
  });

  it('[SC-ALIAS] descriptor, symbol, Map and Set references keep one shared detached identity', () => {
    const symbol = Symbol('hidden');
    const shared = { n: 1 };
    const input = {
      shared,
      map: new Map([[shared, shared]]),
      set: new Set([shared]),
    };
    Object.defineProperty(input, symbol, { value: shared, enumerable: false });
    const copy = cloneDataTree(input, true) as typeof input & {
      [symbol]: typeof shared;
    };
    expect(copy.shared).not.toBe(shared);
    expect(copy.map.get(copy.shared)).toBe(copy.shared);
    expect([...copy.set][0]).toBe(copy.shared);
    expect(copy[symbol]).toBe(copy.shared);
    expect(Object.getOwnPropertyDescriptor(copy, symbol)?.enumerable).toBe(
      false,
    );
    expect(Object.isFrozen(copy.shared)).toBe(true);
    copy.map.forEach((_value, _key, collection) => {
      expect(collection).toBe(copy.map);
      expect(() => collection.clear()).toThrow(TypeError);
    });
    expect(copy.map.valueOf()).toBe(copy.map);
  });
});

describe('schema contracts: parser-created accessor detachment (MP08b)', () => {
  it('[SC-ACCESSOR] a parser-created accessor materializes once per boundary copy with detached identities', () => {
    snapshotCounts.parserRuns = 0;
    snapshotCounts.getterReads = 0;
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('note', () => true);
    }, snapshotSchema() as never);
    const result = suite.run({ doc: 'd', note: 'n' });

    expect(result.isValid()).toBe(true);
    // One parser run (no validation retry); one materializing read per
    // published copy (suite callback input + result value).
    expect(snapshotCounts.parserRuns).toBe(1);
    expect(snapshotCounts.getterReads).toBe(2);
    const callbackDoc = (seen[0] as { doc: Record<string, unknown> }).doc;
    const resultDoc = (result.value as { doc: Record<string, unknown> }).doc;
    expect(callbackDoc).not.toBe(resultDoc);
    // Materialized accessors read as stable data: further reads add no
    // getter invocations.
    expect(callbackDoc.val).toBe('fixed:d');
    expect(resultDoc.val).toBe('fixed:d');
    expect(snapshotCounts.getterReads).toBe(2);
    // Mutating one published copy touches nothing else.
    (callbackDoc as Record<string, unknown>).val = 'MUT';
    expect(resultDoc.val).toBe('fixed:d');
    expect(snapshotCounts.getterReads).toBe(2);
  });

  it('[SC-ACCESSOR] a retained parser-created accessor is reused without re-reading the getter', () => {
    snapshotCounts.parserRuns = 0;
    snapshotCounts.getterReads = 0;
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('note', () => true);
    }, snapshotSchema() as never);
    suite.run({ doc: 'd', note: 'n' });
    expect(snapshotCounts.getterReads).toBe(2);

    const next = suite.changed('note').run({ doc: 'd', note: 'n2' });
    expect(next.isValid()).toBe(true);
    // The retained mapping stays detached: no new accessor reads and the
    // delivered value is stable across runs.
    expect(snapshotCounts.getterReads).toBe(2);
    expect((next.value as { doc: { val: unknown } }).doc.val).toBe('fixed:d');
    expect((seen[1] as { doc: { val: unknown } }).doc.val).toBe('fixed:d');
    expect(snapshotCounts.getterReads).toBe(2);
  });

  it('[SC-ACCESSOR] two suites sharing one schema keep parser-created accessors detached', () => {
    snapshotCounts.parserRuns = 0;
    snapshotCounts.getterReads = 0;
    const schema = snapshotSchema();
    const seenA: unknown[] = [];
    const seenB: unknown[] = [];
    const suiteA = create(data => {
      seenA.push(data);
      test('note', () => true);
    }, schema as never);
    const suiteB = create(data => {
      seenB.push(data);
      test('note', () => true);
    }, schema as never);
    suiteA.run({ doc: 'd', note: 'a' });
    suiteB.run({ doc: 'd', note: 'b' });

    const docA = (seenA[0] as { doc: Record<string, unknown> }).doc;
    const docB = (seenB[0] as { doc: Record<string, unknown> }).doc;
    expect(docA).not.toBe(docB);
    expect(docA.val).toBe('fixed:d');
    expect(docB.val).toBe('fixed:d');
    (docA as Record<string, unknown>).val = 'MUT-A';
    expect(docB.val).toBe('fixed:d');
  });
});
