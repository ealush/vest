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

describe('cloneDataTree snapshot containers (BB07)', () => {
  it('[SC-BB07] preserves null prototypes, diamonds, and RegExp', () => {
    const shared = { value: 1 };
    const input = {
      empty: Object.assign(Object.create(null), { a: 1 }),
      left: shared,
      right: shared,
      pattern: /ab+c/gi,
    };
    const snapshot = cloneDataTree(input, true) as typeof input;
    expect(Object.getPrototypeOf(snapshot.empty)).toBe(null);
    expect(snapshot.empty).toEqual({ a: 1 });
    // Diamonds stay shared within the copy, detached from the caller.
    expect(snapshot.left).toBe(snapshot.right);
    expect(snapshot.left).not.toBe(shared);
    expect(snapshot.left).toEqual({ value: 1 });
    expect(snapshot.pattern).not.toBe(input.pattern);
    expect(snapshot.pattern.source).toBe('ab+c');
    expect(snapshot.pattern.flags).toContain('g');
    expect(Object.isFrozen(snapshot.pattern)).toBe(true);
    // Stateful use of a frozen global regex rejects: snapshots preserve
    // the pattern, not a usable matcher.
    expect(() => snapshot.pattern.test('xxABCxx')).toThrow(TypeError);
  });

  it('[SC-BB07] keeps overlapping buffer views aliased with offsets inside the copy', () => {
    const buffer = new ArrayBuffer(8);
    const bytes = new Uint8Array(buffer);
    bytes.set([1, 2, 3, 4, 5, 6, 7, 8]);
    const input = {
      buffer,
      first: new Uint16Array(buffer, 0, 2),
      second: new DataView(buffer, 2, 4),
    };
    const snapshot = cloneDataTree(input, true) as typeof input;
    expect(snapshot.buffer).not.toBe(buffer);
    // Overlapping views alias the copied buffer (not the caller buffer)
    // with offsets preserved.
    expect(snapshot.first.buffer).toBe(snapshot.buffer);
    expect(snapshot.second.buffer).toBe(snapshot.buffer);
    expect(snapshot.first.byteOffset).toBe(0);
    expect(snapshot.second.byteOffset).toBe(2);
    expect([...new Uint8Array(snapshot.buffer)]).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    new Uint8Array(snapshot.buffer)[0] = 9;
    expect(bytes[0]).toBe(1);
  });

  it('[SC-BB07] never invokes setter-only properties and preserves getters', () => {
    let setterCalls = 0;
    const input = { plain: 1 };
    Object.defineProperty(input, 'setterOnly', {
      configurable: true,
      enumerable: true,
      set() {
        setterCalls += 1;
      },
    });
    Object.defineProperty(input, 'getter', {
      configurable: true,
      enumerable: true,
      get() {
        return 42;
      },
    });
    const snapshot = cloneDataTree(input, true) as Record<string, unknown>;
    expect(setterCalls).toBe(0);
    expect(snapshot.plain).toBe(1);
    expect(Object.hasOwn(snapshot, 'getter')).toBe(true);
  });
});
