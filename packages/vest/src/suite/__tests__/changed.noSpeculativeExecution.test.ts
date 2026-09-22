import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create } from '../../vest';

const CHAIN_BASELINE = Symbol.for('vest:chainBaseline');

/**
 * Simulates an unknown/exotic container: a real combinator-built rule with
 * its construction-time baseline removed, so no metadata describes its
 * semantics. Introspection must never behaviorally probe such rules.
 */
function stripBaseline(rule: unknown): void {
  (rule as unknown as Record<symbol, unknown>)[CHAIN_BASELINE] = undefined;
}

describe('changed() never speculatively executes user validators', () => {
  it('does not probe an unmarked top-level container with a synthetic value', async () => {
    // The spy sits on the first member: n4s containers short-circuit at
    // the first failure, so a synthetic {} probe would execute it with
    // undefined (the key is missing from the probe value).
    const seenA: unknown[] = [];
    const schema = enforce.shape({
      a: enforce.condition((value: unknown): boolean => {
        seenA.push(value);
        return typeof value === 'string';
      }),
      b: enforce.isString(),
    });
    stripBaseline(schema);

    const changed = await create((): void => {}, schema)
      .changed('b')
      .run({ a: 'x', b: 'ok' });

    // Every execution of a's validator uses real run data ('x').
    expect(seenA).toContain('x');
    expect(seenA).not.toContain(undefined);
    // Full-run fallback with affected filtering: 'a' is not reported.
    expect(changed.hasErrors('a')).toBe(false);
    expect(changed.hasErrors('b')).toBe(false);
  });

  it('does not probe an unmarked nested container with a synthetic value', async () => {
    const seenY: unknown[] = [];
    // Invalidity is runtime-driven (flag), not type-driven: the data stays
    // well-typed while the member fails, so no type escape is needed to
    // model an invalid unaffected member.
    const xValid = { current: false };
    const nested = enforce.shape({
      y: enforce.condition((value: unknown): boolean => {
        seenY.push(value);
        return typeof value === 'string';
      }),
      x: enforce.condition((): boolean => xValid.current),
    });
    stripBaseline(nested);
    const schema = enforce.shape({
      a: enforce.isString(),
      nested,
    });

    const changed = await create((): void => {}, schema)
      .changed('nested.y')
      .run({ a: 'ok', nested: { y: 'ok', x: 'bad' } });

    expect(seenY).toContain('ok');
    expect(seenY).not.toContain(undefined);
    expect(changed.hasErrors('nested.x')).toBe(false);
    expect(changed.hasErrors('nested.y')).toBe(false);

    // The affected-invalid direction still surfaces through the filter.
    const changedInvalid = await create((): void => {}, schema)
      .changed('nested.x')
      .run({ a: 'ok', nested: { y: 'ok', x: 'bad' } });
    expect(changedInvalid.hasErrors('nested.x')).toBe(true);
  });

  it('positive controls: unaffected-invalid stays unreported while affected validators fire with real data', async () => {
    const seenB: unknown[] = [];
    const schema = enforce.shape({
      a: enforce.condition(
        (value: unknown): boolean => typeof value === 'string',
      ),
      b: enforce.condition((value: unknown): boolean => {
        seenB.push(value);
        return typeof value === 'string';
      }),
    });
    stripBaseline(schema);

    const suite = create((): void => {}, schema);
    const changed = await suite.changed('b').run({ a: 42, b: 'ok' });

    // The affected validator really fired, with real run data.
    expect(seenB).toEqual(['ok']);
    // 'a' is invalid but unaffected: the fallback narrows it out.
    expect(changed.hasErrors('a')).toBe(false);
    expect(changed.hasErrors('b')).toBe(false);

    // Affected-invalid variant: the changed field itself reports.
    const changedInvalid = await suite.changed('b').run({ a: 42, b: 42 });
    expect(changedInvalid.hasErrors('b')).toBe(true);
    expect(changedInvalid.hasErrors('a')).toBe(false);
  });
});
