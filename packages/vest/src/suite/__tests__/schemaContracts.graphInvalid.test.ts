import { describe, expect, it, vi } from 'vitest';
import { enforce } from 'n4s';

import { create, mode, Modes, test } from '../../vest';

// GR01b: multiple simultaneous invalid fields with schema-predicate
// observations; disjoint/overlapping dependencies; selected + retained
// failures coexist; predicate census per execution. All observations use
// the public outer API (create/test/changed/run + result selectors).
function invalidFixture() {
  // Vest short-circuits schema predicates after the first schema failure,
  // so simultaneous invalid fields are observed through imperative tests
  // (ALL mode runs every imperative test) while schema predicates are
  // observed alongside as passing census spies.
  const pa = vi.fn(() => true);
  const pb = vi.fn(() => true);
  const pc = vi.fn(() => true);
  const ia = vi.fn(() => false);
  const ib = vi.fn(() => false);
  const ic = vi.fn(() => true);
  const schema = enforce.shape({
    a: enforce.condition(pa),
    b: enforce.condition(pb),
    c: enforce.condition(pc),
  });
  const suite = create((_data: unknown) => {
    mode(Modes.ALL);
    test('a', 'a is bad', ia);
    test('b', 'b is bad', ib);
    test('c', ic);
  }, schema);
  return { suite, pa, pb, pc, ia, ib, ic };
}

function dependentFixture() {
  const pa = vi.fn(() => true);
  const pb = vi.fn(() => true);
  const pc = vi.fn(() => true);
  const pd = vi.fn(() => true);
  const schema = enforce.shape({
    a: enforce.condition(pa),
    // Overlapping: b and c both depend on a.
    b: enforce.condition(pb).dependsOn($ => $.a),
    c: enforce.condition(pc).dependsOn($ => $.a),
    // Disjoint: d has no relationship to a/b/c.
    d: enforce.condition(pd),
  });
  const calls: string[] = [];
  const suite = create((_data: unknown) => {
    mode(Modes.ALL);
    for (const field of ['a', 'b', 'c', 'd'] as const) {
      test(field, () => {
        calls.push(field);
        return true;
      });
    }
  }, schema);
  return { suite, schema, pa, pb, pc, pd, calls };
}

describe('schema contracts: multiple invalid fields and dependency census (GR01b)', () => {
  it('[SC-GR01b] multiple simultaneous invalid fields report each failure with a full predicate census', () => {
    const { suite, pa, pb, pc, ia, ib, ic } = invalidFixture();
    const result = suite.run({ a: 'bad', b: 'bad', c: 'ok' });

    expect(result.hasErrors('a')).toBe(true);
    expect(result.hasErrors('b')).toBe(true);
    expect(result.hasErrors('c')).toBe(false);
    expect(result.hasErrors()).toBe(true);
    // ALL mode: every selected predicate and every imperative test runs once.
    expect(pa).toHaveBeenCalledTimes(1);
    expect(pb).toHaveBeenCalledTimes(1);
    expect(pc).toHaveBeenCalledTimes(1);
    expect(ia).toHaveBeenCalledTimes(1);
    expect(ib).toHaveBeenCalledTimes(1);
    expect(ic).toHaveBeenCalledTimes(1);
    expect(result.getErrors('a')).toHaveLength(1);
    expect(result.getErrors('b')).toHaveLength(1);
  });

  it('[SC-GR01b] overlapping dependents fan out while disjoint fields stay silent', () => {
    const { suite, pa, pb, pc, pd, calls } = dependentFixture();
    const data = { a: 'x', b: 'y', c: 'z', d: 'w' };

    const result = suite.changed('a').run(data);

    expect(result.hasErrors()).toBe(false);
    expect(calls.sort()).toEqual(['a', 'b', 'c']);
    expect(pa).toHaveBeenCalledTimes(1);
    expect(pb).toHaveBeenCalledTimes(1);
    expect(pc).toHaveBeenCalledTimes(1);
    expect(pd).not.toHaveBeenCalled();
  });

  it('[SC-GR01b] disjoint change selects only its own field', () => {
    const { suite, pa, pb, pc, pd, calls } = dependentFixture();
    const data = { a: 'x', b: 'y', c: 'z', d: 'w' };

    const result = suite.changed('d').run(data);

    expect(result.hasErrors()).toBe(false);
    expect(calls).toEqual(['d']);
    expect(pd).toHaveBeenCalledTimes(1);
    expect(pa).not.toHaveBeenCalled();
    expect(pb).not.toHaveBeenCalled();
    expect(pc).not.toHaveBeenCalled();
  });

  it('[SC-GR01b] selected success coexists with retained failure without rerunning the retained predicate', () => {
    // Retained failures are imperative (ALL mode reports every imperative
    // failure); the schema census proves only the selected schema
    // predicate reran while the retained field stayed silent.
    const pa = vi.fn(() => true);
    const pd = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(pa),
      d: enforce.condition(pd),
    });
    const imperative: string[] = [];
    const suite = create((raw: unknown) => {
      const data = raw as { a: string; d: string };
      mode(Modes.ALL);
      test('a', () => {
        imperative.push('a');
        return data.a !== 'bad';
      });
      test('d', () => {
        imperative.push('d');
        return false;
      });
    }, schema);

    const seeded = suite.run({ a: 'bad', d: 'bad' });
    expect(seeded.hasErrors('a')).toBe(true);
    expect(seeded.hasErrors('d')).toBe(true);

    pa.mockClear();
    pd.mockClear();
    imperative.length = 0;

    const focused = suite.changed('a').run({ a: 'good', d: 'bad' });
    // Selected field repaired; unrelated retained failure stays reported.
    expect(focused.hasErrors('a')).toBe(false);
    expect(focused.hasErrors('d')).toBe(true);
    expect(focused.hasErrors()).toBe(true);
    // Census: only the selected predicate (and its imperative test) reran.
    expect(pa).toHaveBeenCalledTimes(1);
    expect(pd).not.toHaveBeenCalled();
    expect(imperative).toEqual(['a']);
  });

  it('[SC-GR01b] all-pass changed census executes exactly the affected set once', () => {
    const { suite, pa, pb, pc, pd } = dependentFixture();
    const data = { a: 'x', b: 'y', c: 'z', d: 'w' };

    suite.changed('a').run(data);

    expect(pa).toHaveBeenCalledTimes(1);
    expect(pb).toHaveBeenCalledTimes(1);
    expect(pc).toHaveBeenCalledTimes(1);
    expect(pd).not.toHaveBeenCalled();
  });
});
