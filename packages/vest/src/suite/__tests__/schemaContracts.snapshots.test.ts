import { describe, expect, it, vi } from 'vitest';

import { cloneDataTree } from '../cloneDataTree';

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
