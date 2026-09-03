import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      countSupplementValue: (value: unknown) => boolean;
      countFallbackState: (value: unknown) => boolean;
      hasFallbackFlag: (value: { flag?: unknown }) => boolean;
      countKeyedValue: (value: unknown) => boolean;
      countFlatMember: (value: unknown) => boolean;
    }
  }
}

describe('changed() supplement exactly-once execution', () => {
  it('record per-key: the affected member validator fires exactly once', async () => {
    // F3: the projection keeps records whole (key-rule parity), so the
    // main run already executes every key. The supplement must not re-run
    // affected keys on top: a once-only stateful validator false-fails on
    // its second call.
    const calls: unknown[] = [];
    enforce.extend({
      countSupplementValue: (value: unknown): boolean => {
        calls.push(value);
        return (
          calls.filter(seen => seen === value).length === 1 &&
          typeof value === 'string'
        );
      },
    });
    const schema = enforce.shape({
      dict: enforce.record(enforce.isString().countSupplementValue()),
    });
    const suite = create((): void => {}, schema);
    const data = { dict: { a: 'x', b: 'y' } };

    const changed = await suite.changed('dict.a').run(data);
    expect(changed.hasErrors()).toBe(false);
    // The affected key ran once (in the kept-whole main run, never again
    // in the supplement); the whole-record main run covers both keys once.
    expect(calls.filter(value => value === 'x')).toHaveLength(1);
    expect(calls).toHaveLength(2);
  });

  it('record per-key: a failing affected key is still reported', async () => {
    // Guard against over-skipping: the exactly-once skip applies only when
    // the main run passed the container, never to real failures.
    const schema = enforce.shape({
      dict: enforce.record(enforce.isString().longerThan(5)),
    });
    const suite = create((): void => {}, schema);
    const data = { dict: { a: 'x', b: 'yyyyyy' } };

    const changed = await suite.changed('dict.a').run(data);
    expect(changed.hasErrors('dict.a')).toBe(true);
    expect(changed.hasErrors('dict.b')).toBe(false);
  });

  it('record per-key: an affected key-rule violation surfaces', async () => {
    // W1: two-arg records close over a key rule no slot exposes. The
    // whole-record main run reports only the first failing key and the
    // supplement ran only the value rule, so changed('dict.a') stayed
    // clean though 'a' itself violates the key rule.
    const schema = enforce.shape({
      dict: enforce.record(
        enforce.isString().longerThan(2),
        enforce.isNumber(),
      ),
    });
    const suite = create((): void => {}, schema);
    const data = { dict: { ab: 1, a: 2 } };

    const full = await suite.run(data);
    expect(full.hasErrors('dict.ab')).toBe(true);

    const changedA = await suite.changed('dict.a').run(data);
    expect(changedA.hasErrors('dict.a')).toBe(true);

    const changedAb = await suite.changed('dict.ab').run(data);
    expect(changedAb.hasErrors('dict.ab')).toBe(true);
  });

  it('record per-key: passing two-arg entries still execute exactly once', async () => {
    // The single-entry run replaces the value-only run (never adds to
    // it), so a stateful value validator fires once total.
    const calls: unknown[] = [];
    enforce.extend({
      countKeyedValue: (value: unknown): boolean => {
        calls.push(value);
        return typeof value === 'number';
      },
    });
    const schema = enforce.shape({
      dict: enforce.record(
        enforce.isString().longerThan(2),
        enforce.isNumber().countKeyedValue(),
      ),
    });
    const suite = create((): void => {}, schema);
    const data = { dict: { abc: 1, def: 2 } };

    const changed = await suite.changed('dict.abc').run(data);
    expect(changed.hasErrors()).toBe(false);
    expect(calls.filter(value => value === 1)).toHaveLength(1);
    expect(calls).toHaveLength(2);
  });

  it('flat changed() surfaces an affected member hidden by first-failure order', async () => {
    // W2: the flat path filtered a first-failure-only full run with no
    // per-member supplement, so changed('b') stayed clean though 'b' is
    // invalid — the full run only ever reported 'a'.
    const schema = enforce.shape({
      a: enforce.isString().longerThan(5),
      b: enforce.isString().longerThan(5),
    });
    const suite = create((): void => {}, schema);
    const data = { a: 'x', b: 'y' };

    const full = await suite.run(data);
    expect(full.hasErrors('a')).toBe(true);

    const changed = await suite.changed('b').run(data);
    expect(changed.hasErrors('b')).toBe(true);
    expect(changed.hasErrors('a')).toBe(false);
  });

  it('only()+changed() merge honors the affected member too', async () => {
    // W3: the merged base-only + affected set filters reporting, but the
    // affected failure never made it into the merged results at all.
    const schema = enforce.shape({
      a: enforce.isString().longerThan(5),
      b: enforce.isString().longerThan(5),
    });
    const suite = create((): void => {}, schema);
    const data = { a: 'x', b: 'y' };

    const changed = await suite.focus({ only: 'a' }).changed('b').run(data);
    expect(changed.hasErrors('a')).toBe(true);
    expect(changed.hasErrors('b')).toBe(true);
  });

  it('flat supplement runs each shadowed member through one execution unit', async () => {
    // Members the main run reached (up to and including the failure) run
    // there; members after it run once in the supplement — never both. One
    // unit is parse-then-run: a failing member fires twice inside it (the
    // engine's own duality, identical in full runs), a passing member once.
    const calls: unknown[] = [];
    enforce.extend({
      countFlatMember: (value: unknown): boolean => {
        calls.push(value);
        return typeof value === 'string' && value.length > 5;
      },
    });
    const schema = enforce.shape({
      a: enforce.isString().longerThan(5),
      b: enforce.isString().countFlatMember(),
      c: enforce.isString().countFlatMember(),
    });
    const suite = create((): void => {}, schema);
    const data = { a: 'x', b: 'y', c: 'ok-ok-ok' };

    const changed = await suite.changed(['b', 'c']).run(data);
    expect(changed.hasErrors('b')).toBe(true);
    expect(changed.hasErrors('c')).toBe(false);
    expect(calls.filter(value => value === 'y')).toHaveLength(2);
    expect(calls.filter(value => value === 'ok-ok-ok')).toHaveLength(1);
  });

  it('union supplement rejection mirrors the full-run failure exactly', async () => {
    // W4: an all-rejected union element fails generically on both sides
    // (n4s returns a message-less failure for multi-rule rejection). The
    // supplement must not invent a message the full run does not report —
    // identical keys dedupe correctly, differing messages would diverge.
    // Contract-pinning (green before and after): guards future drift.
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          kind: enforce.isString(),
          v: enforce.isNumber(),
        }),
        enforce.isString().longerThan(5),
      ),
    });
    const suite = create((): void => {}, schema);
    // Type-valid inputs: 'xx' is a string, but too short for the string
    // member and not an object for the shape member — rejected by all.
    const data = { rows: ['long-enough', 'xx'] };

    const full = await suite.run(data);
    expect(full.hasErrors('rows.1')).toBe(true);

    const changed = await suite.changed('rows.1').run(data);
    expect(changed.hasErrors('rows.1')).toBe(true);
    expect(changed.getErrors()['rows.1']).toEqual(full.getErrors()['rows.1']);
  });

  it('full-fallback path executes each member validator at most once', async () => {
    // F4: a validator chained after the top container moves the baseline,
    // so the projection falls back to a full-schema main run. The
    // per-member supplement must not run on top of it.
    const calls: unknown[] = [];
    enforce.extend({
      countFallbackState: (value: unknown): boolean => {
        calls.push(value);
        return typeof value === 'string';
      },
    });
    enforce.extend({
      hasFallbackFlag: (value: { flag?: unknown }): boolean =>
        value.flag === true,
    });
    const schema = enforce
      .loose({
        rows: enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce.isString().countFallbackState(),
          }),
        ),
        flag: enforce.isBoolean(),
      })
      .hasFallbackFlag();
    const suite = create((): void => {}, schema);
    const data = {
      rows: [
        { country: 'US', state: 'CA' },
        { country: 'CA', state: 'NY' },
      ],
      flag: true,
    };

    const changed = await suite.changed('rows.1.state').run(data);
    expect(changed.hasErrors()).toBe(false);
    expect(calls.filter(value => value === 'NY')).toHaveLength(1);
    expect(calls.filter(value => value === 'CA')).toHaveLength(1);
  });
});
