import { describe, expect, it, vi } from 'vitest';

import { create, enforce, mode, Modes, test } from '../../vest';

/**
 * GR06/FP04: deterministic bounded exploration over generated graphs and
 * operation sequences. Every run asserts the executed set and the retained
 * error set against an explicit oracle that models one-hop invalidation
 * and history rules (retention, destructive skip, reset/remove clearing).
 */

// Small deterministic PRNG (mulberry32) so failures print a reproducible seed.
function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIELDS = ['a', 'b', 'c', 'd', 'e'] as const;
type Field = (typeof FIELDS)[number];

type Op =
  | { kind: 'full'; invalid: Field[] }
  | { kind: 'changed'; changed: Field[]; invalid: Field[] }
  | { kind: 'skip'; skip: Field[]; invalid: Field[] }
  | { kind: 'only'; only: Field[]; invalid: Field[] }
  | { kind: 'resetField'; field: Field }
  | { kind: 'reset' };

function planOperations(seed: number): { edges: [Field, Field][]; ops: Op[] } {
  const rand = rng(seed);
  const edges: [Field, Field][] = [];
  for (const source of FIELDS) {
    for (const target of FIELDS) {
      if (source !== target && rand() < 0.25) edges.push([source, target]);
    }
  }
  // Deterministic Fisher-Yates (cross-engine seed replay): random-sort
  // shuffling biases permutations and varies by engine.
  const pick = (count: number): Field[] => {
    const shuffled = [...FIELDS];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      const swap = shuffled[i] as Field;
      shuffled[i] = shuffled[j] as Field;
      shuffled[j] = swap;
    }
    return shuffled.slice(0, count);
  };
  const invalid = (): Field[] => FIELDS.filter(() => rand() < 0.3);
  const ops: Op[] = [];
  for (let i = 0; i < 20; i += 1) {
    const roll = rand();
    if (roll < 0.3) ops.push({ kind: 'full', invalid: invalid() });
    else if (roll < 0.6)
      ops.push({
        kind: 'changed',
        changed: pick(1 + (rand() < 0.5 ? 1 : 0)),
        invalid: invalid(),
      });
    else if (roll < 0.72)
      ops.push({ kind: 'skip', skip: pick(1), invalid: invalid() });
    else if (roll < 0.82)
      ops.push({ kind: 'only', only: pick(1), invalid: invalid() });
    else if (roll < 0.9)
      ops.push({ kind: 'resetField', field: pick(1)[0] as Field });
    else ops.push({ kind: 'reset' });
  }
  return { edges, ops };
}

function targetsOf(edges: [Field, Field][], sources: Field[]): Set<Field> {
  const out = new Set<Field>(sources);
  for (const [source, target] of edges) {
    if (sources.includes(source)) out.add(target);
  }
  return out;
}

describe('schema contracts: deterministic state machine', () => {
  it.each(Array.from({ length: 100 }, (_, seed) => seed))(
    '[SC-STATE-MACHINE] seed %i converges execution and retention with the oracle',
    seed => {
      const { edges, ops } = planOperations(seed);
      const calls: Field[] = [];
      const schemaCalls: Field[] = [];
      const member = (field: Field) => {
        const rule = enforce.condition(() => {
          schemaCalls.push(field);
          return true;
        });
        const sources = edges
          .filter(([, target]) => target === field)
          .map(([source]) => source);
        if (sources.length === 0) return rule;
        // Type-level only: the runtime object keeps its dependency metadata.
        return rule.dependsOn(scope =>
          sources.map(source => scope[source]),
        ) as unknown as typeof rule;
      };
      const schema = enforce.shape({
        a: member('a'),
        b: member('b'),
        c: member('c'),
        d: member('d'),
        e: member('e'),
      });
      const dataOf = (invalid: Field[]) =>
        Object.fromEntries(
          FIELDS.map(field => [field, invalid.includes(field) ? 'bad' : 'ok']),
        );
      const suite = create(data => {
        mode(Modes.ALL);
        for (const field of FIELDS) {
          test(field, () => {
            calls.push(field);
            enforce(data[field] as string).notEquals('bad');
          });
        }
      }, schema);

      // Oracle state: fields currently carrying errors.
      let errors = new Set<Field>();
      // vitest forbids message arguments, so failure context travels
      // inside the compared payloads.
      const check = (actual: unknown, expected: unknown, where: string) => {
        expect({ where, value: actual }).toEqual({ where, value: expected });
      };
      const expectState = (message: string) => {
        for (const field of FIELDS) {
          check(
            suite.get().hasErrors(field),
            errors.has(field),
            `${message} seed=${seed} field=${field}`,
          );
        }
      };

      for (const [index, op] of ops.entries()) {
        const where = `seed=${seed} op=${index} kind=${op.kind}`;
        if (op.kind === 'resetField') {
          suite.resetField(op.field);
          errors.delete(op.field);
          expectState(where);
          continue;
        }
        if (op.kind === 'reset') {
          suite.reset();
          errors = new Set();
          expectState(where);
          continue;
        }
        calls.length = 0;
        schemaCalls.length = 0;
        const data = dataOf(op.invalid);
        if (op.kind === 'full') {
          suite.run(data);
          check([...calls].sort(), [...FIELDS].sort(), where);
          check([...schemaCalls].sort(), [...FIELDS].sort(), `${where} schema`);
          errors = new Set(op.invalid);
        } else if (op.kind === 'changed') {
          suite.changed(op.changed).run(data);
          const executed = targetsOf(edges, op.changed);
          check([...calls].sort(), [...executed].sort(), where);
          check(
            [...schemaCalls].sort(),
            [...executed].sort(),
            `${where} schema`,
          );
          errors = new Set(
            [...errors]
              .filter(field => !executed.has(field))
              .concat(op.invalid.filter(field => executed.has(field))),
          );
        } else if (op.kind === 'only') {
          suite.only(op.only).run(data);
          const executed = new Set(op.only);
          check([...calls].sort(), [...executed].sort(), where);
          check(
            [...schemaCalls].sort(),
            [...executed].sort(),
            `${where} schema`,
          );
          errors = new Set(
            [...errors]
              .filter(field => !executed.has(field))
              .concat(op.invalid.filter(field => executed.has(field))),
          );
        } else {
          suite.focus({ skip: op.skip }).run(data);
          const executed = new Set(
            FIELDS.filter(field => !op.skip.includes(field)),
          );
          check([...calls].sort(), [...executed].sort(), where);
          check(
            [...schemaCalls].sort(),
            [...executed].sort(),
            `${where} schema`,
          );
          errors = new Set(op.invalid.filter(field => executed.has(field)));
        }
        expectState(where);
      }
    },
  );
});

describe('schema contracts: metamorphic properties', () => {
  function pureFixture() {
    const calls: string[] = [];
    const suite = create(
      (data: Record<string, string>) => {
        mode(Modes.ALL);
        for (const field of ['a', 'b', 'c'] as const) {
          test(field, () => {
            calls.push(field);
            enforce(data[field]).notEquals('bad');
          });
        }
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
        c: enforce.isString(),
      }),
    );
    return { calls, suite };
  }

  it('[SC-METAMORPHIC] input key order preserves verdicts', () => {
    const first = pureFixture();
    const second = pureFixture();
    const a = first.suite.run({ a: 'bad', b: 'ok', c: 'ok' });
    const b = second.suite.run({ c: 'ok', b: 'ok', a: 'bad' });
    expect(b.hasErrors('a')).toBe(a.hasErrors('a'));
    expect(b.hasErrors('b')).toBe(a.hasErrors('b'));
    expect(b.isValid()).toBe(a.isValid());
    expect(b.getErrors()).toEqual(a.getErrors());
  });

  it('[SC-METAMORPHIC] duplicate change selectors behave as a set', () => {
    const first = pureFixture();
    const second = pureFixture();
    first.suite.run({ a: 'ok', b: 'ok', c: 'ok' });
    second.suite.run({ a: 'ok', b: 'ok', c: 'ok' });
    const a = first.suite
      .changed(['a', 'a', 'b', 'b'])
      .run({ a: 'bad', b: 'ok', c: 'ok' });
    const b = second.suite
      .changed(['a', 'b'])
      .run({ a: 'bad', b: 'ok', c: 'ok' });
    expect(b.hasErrors('a')).toBe(a.hasErrors('a'));
    expect(first.calls.sort()).toEqual(second.calls.sort());
  });

  it('[SC-METAMORPHIC] change order converges after a final full run', () => {
    const first = pureFixture();
    const second = pureFixture();
    const data = { a: 'bad', b: 'bad', c: 'ok' };
    first.suite.changed('a').run(data);
    first.suite.changed('b').run(data);
    second.suite.changed('b').run(data);
    second.suite.changed('a').run(data);
    const a = first.suite.run(data);
    const b = second.suite.run(data);
    expect(b.getErrors()).toEqual(a.getErrors());
    expect(b.isValid()).toBe(a.isValid());
  });
});

describe('schema contracts: full/selective agreement (metamorphic)', () => {
  it('[SC-METAMORPHIC] full and selective runs agree on every executed validator verdict', () => {
    function fixture() {
      const calls: string[] = [];
      const suite = create(
        (data: Record<string, string>) => {
          mode(Modes.ALL);
          for (const field of ['a', 'b', 'c'] as const) {
            test(field, () => {
              calls.push(field);
              enforce(data[field]).notEquals('bad');
            });
          }
        },
        enforce.shape({
          a: enforce.isString(),
          b: enforce.isString().dependsOn(($: any) => $.a),
          c: enforce.isString(),
        }),
      );
      return { calls, suite };
    }
    const data = { a: 'bad', b: 'ok', c: 'bad' };
    const full = fixture();
    const fullResult = full.suite.run(data);
    const selective = fixture();
    const selectiveResult = selective.suite.changed('a').run(data);
    // changed('a') executes a and its dependent b; both runs must agree
    // on those validators' verdicts and mapped values.
    for (const field of ['a', 'b'] as const) {
      expect(selectiveResult.hasErrors(field)).toBe(
        fullResult.hasErrors(field),
      );
    }
    expect(selectiveResult.hasErrors('a')).toBe(true);
    expect(selectiveResult.hasErrors('b')).toBe(false);
    expect(full.calls.sort()).toEqual(['a', 'b', 'c']);
    expect(selective.calls.sort()).toEqual(['a', 'b']);
  });

  it('[SC-METAMORPHIC] changing only an unrelated field never executes a dependent', () => {
    const dependent = vi.fn(() => true);
    const fixture = () => {
      const calls: string[] = [];
      const suite = create(
        (data: Record<string, string>) => {
          mode(Modes.ALL);
          test('target', () => {
            calls.push('target');
            enforce(data.target).isString();
          });
          test('unrelated', () => {
            calls.push('unrelated');
            enforce(data.unrelated).isString();
          });
        },
        enforce.shape({
          target: enforce.isString(),
          dependent: enforce
            .condition(dependent)
            .dependsOn(($: any) => $.target),
          unrelated: enforce.isString(),
        }),
      );
      return { calls, suite };
    };
    const first = fixture();
    first.suite.run({ target: 'ok', dependent: 'ok', unrelated: 'ok' });
    dependent.mockClear();
    first.calls.length = 0;
    first.suite.changed('unrelated').run({
      target: 'ok',
      dependent: 'ok',
      unrelated: 'changed',
    });
    expect(first.calls).toEqual(['unrelated']);
    expect(dependent).not.toHaveBeenCalled();
  });
});

describe('schema contracts: declaration stability (metamorphic)', () => {
  it('[SC-METAMORPHIC] adding an unrelated schema field preserves the dependency closure', () => {
    const calls: string[] = [];
    const base = {
      a: enforce.isString(),
      b: enforce.isString().dependsOn(($: any) => $.a),
    };
    const withoutExtra: any = create(
      (_data: unknown) => {
        test('a', () => {
          calls.push('a');
          return true;
        });
        test('b', () => {
          calls.push('b');
          return true;
        });
      },
      enforce.shape(base) as never,
    );
    const withExtra: any = create(
      (_data: unknown) => {
        test('a', () => {
          calls.push('a');
          return true;
        });
        test('b', () => {
          calls.push('b');
          return true;
        });
      },
      enforce.shape({ ...base, unrelated: enforce.isString() }) as never,
    );
    const data = { a: 'x', b: 'y', unrelated: 'z' };
    withoutExtra.changed('a').run({ a: 'x', b: 'y' });
    const before = [...calls].sort();
    calls.length = 0;
    withExtra.changed('a').run(data as never);
    // The unrelated field participates in no edge: identical execution.
    expect([...calls].sort()).toEqual(before);
    expect(before).toEqual(['a', 'b']);
  });
});
