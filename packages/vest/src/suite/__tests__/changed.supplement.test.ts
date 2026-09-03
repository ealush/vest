import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      countSupplementValue: (value: unknown) => boolean;
      countFallbackState: (value: unknown) => boolean;
      hasFallbackFlag: (value: { flag?: unknown }) => boolean;
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
