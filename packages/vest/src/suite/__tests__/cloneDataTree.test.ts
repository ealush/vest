import { describe, expect, it } from 'vitest';

import { cloneDataTree } from '../cloneDataTree';

describe('cloneDataTree', () => {
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
});
