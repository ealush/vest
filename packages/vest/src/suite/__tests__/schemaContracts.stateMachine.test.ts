import { describe, expect, it } from 'vitest';

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
  | { kind: 'resetField'; field: Field };

function planOperations(seed: number): { edges: [Field, Field][]; ops: Op[] } {
  const rand = rng(seed);
  const edges: [Field, Field][] = [];
  for (const source of FIELDS) {
    for (const target of FIELDS) {
      if (source !== target && rand() < 0.25) edges.push([source, target]);
    }
  }
  const pick = (count: number): Field[] => {
    const shuffled = [...FIELDS].sort(() => rand() - 0.5);
    return shuffled.slice(0, count);
  };
  const invalid = (): Field[] => FIELDS.filter(() => rand() < 0.3);
  const ops: Op[] = [];
  for (let i = 0; i < 20; i += 1) {
    const roll = rand();
    if (roll < 0.35) ops.push({ kind: 'full', invalid: invalid() });
    else if (roll < 0.7)
      ops.push({
        kind: 'changed',
        changed: pick(1 + (rand() < 0.5 ? 1 : 0)),
        invalid: invalid(),
      });
    else if (roll < 0.85)
      ops.push({ kind: 'skip', skip: pick(1), invalid: invalid() });
    else ops.push({ kind: 'resetField', field: pick(1)[0] as Field });
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
      const member = (field: Field) => {
        const rule = enforce.condition(() => true);
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
        calls.length = 0;
        const data = dataOf(op.invalid);
        if (op.kind === 'full') {
          suite.run(data);
          check([...calls].sort(), [...FIELDS].sort(), where);
          errors = new Set(op.invalid);
        } else if (op.kind === 'changed') {
          suite.changed(op.changed).run(data);
          const executed = targetsOf(edges, op.changed);
          check([...calls].sort(), [...executed].sort(), where);
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
