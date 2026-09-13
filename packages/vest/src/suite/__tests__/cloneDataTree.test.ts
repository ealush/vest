import { describe, expect, it } from 'vitest';

import { cloneDataTree } from '../cloneDataTree';

describe('cloneDataTree', () => {
  it('clones custom symbol descriptors and cycles on built-in values', () => {
    const metadata = Symbol('metadata');
    type DateWithMetadata = Date & {
      [metadata]: { owner: DateWithMetadata; nested: { value: number } };
      customMethod: () => string;
    };
    const input = new Date('2026-01-02T00:00:00.000Z') as DateWithMetadata;
    const customMethod = (): string => 'custom';
    Object.defineProperty(input, metadata, {
      configurable: true,
      enumerable: false,
      value: { owner: input, nested: { value: 1 } },
      writable: true,
    });
    Object.defineProperty(input, 'customMethod', {
      configurable: true,
      value: customMethod,
      writable: true,
    });

    const snapshot = cloneDataTree(input, true) as DateWithMetadata;
    const descriptor = Object.getOwnPropertyDescriptor(snapshot, metadata);

    expect(snapshot).not.toBe(input);
    expect(descriptor?.enumerable).toBe(false);
    expect(snapshot[metadata]).not.toBe(input[metadata]);
    expect(snapshot[metadata].owner).toBe(snapshot);
    expect(Object.isFrozen(snapshot[metadata].nested)).toBe(true);
    expect(snapshot.customMethod).toBe(customMethod);
  });

  it('deeply isolates mutable copies while preserving cycles', () => {
    const input: { child: { value: number }; self?: unknown } = {
      child: { value: 1 },
    };
    input.self = input;

    const copy = cloneDataTree(input) as typeof input;
    copy.child.value = 2;

    expect(input.child.value).toBe(1);
    expect(copy.self).toBe(copy);
  });

  it('creates readable immutable Map, Set, and Date snapshots', () => {
    const input = {
      date: new Date('2026-01-02T00:00:00.000Z'),
      map: new Map([['a', 1]]),
      set: new Set(['a']),
    };
    const snapshot = cloneDataTree(input, true) as typeof input;

    expect(snapshot.map.get('a')).toBe(1);
    expect([...snapshot.set]).toEqual(['a']);
    expect(snapshot.date.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(snapshot.map).toBeInstanceOf(Map);
    expect(snapshot.set).toBeInstanceOf(Set);
    expect(snapshot.date).toBeInstanceOf(Date);
    expect(Object.isFrozen(snapshot.map)).toBe(true);
    expect(Object.isFrozen(snapshot.set)).toBe(true);
    expect(Object.isFrozen(snapshot.date)).toBe(true);
    expect(() => snapshot.map.set('b', 2)).toThrow(TypeError);
    expect(() => snapshot.set.add('b')).toThrow(TypeError);
    expect(() => snapshot.date.setUTCFullYear(2030)).toThrow(TypeError);
  });

  it('preserves internal-slot objects without creating broken prototype shells', () => {
    class PrivateValue {
      readonly #value: number;

      constructor(value: number) {
        this.#value = value;
      }

      read(): number {
        return this.#value;
      }
    }

    const privateValue = new PrivateValue(7);
    const weakKey = {};
    const weakMap = new WeakMap([[weakKey, 'kept']]);
    const input = {
      buffer: new Uint8Array([3, 4]).buffer,
      privateValue,
      typed: new Uint8Array([1, 2]),
      view: new DataView(new Uint8Array([5, 6]).buffer),
      weakMap,
    };

    const snapshot = cloneDataTree(input, true) as typeof input;

    expect(snapshot.typed).not.toBe(input.typed);
    expect([...snapshot.typed]).toEqual([1, 2]);
    expect([...snapshot.typed.slice(1)]).toEqual([2]);
    expect(snapshot.buffer).not.toBe(input.buffer);
    expect([...new Uint8Array(snapshot.buffer)]).toEqual([3, 4]);
    expect(snapshot.view).not.toBe(input.view);
    expect(snapshot.view.getUint8(0)).toBe(5);
    expect(snapshot.privateValue).toBe(privateValue);
    expect(snapshot.privateValue.read()).toBe(7);
    expect(snapshot.weakMap).toBe(weakMap);
    expect(snapshot.weakMap.get(weakKey)).toBe('kept');

    snapshot.typed[0] = 9;
    snapshot.view.setUint8(0, 9);
    new Uint8Array(snapshot.buffer)[0] = 9;
    expect([...input.typed]).toEqual([1, 2]);
    expect(input.view.getUint8(0)).toBe(5);
    expect([...new Uint8Array(input.buffer)]).toEqual([3, 4]);
  });
});
