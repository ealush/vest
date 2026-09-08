import { describe, expect, it } from 'vitest';
import { compose, enforce } from 'n4s';

import { create, test } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      focusedToNumber: (value: unknown) => { pass: boolean; type: number };
      focusedAppend: (value: string) => { pass: boolean; type: string };
      focusedValidator: (value: unknown) => boolean;
    }
  }
}

describe('focused schema callback mapping', () => {
  it('maps a composed structural parser exactly once', async () => {
    enforce.extend(
      {
        focusedAppend: (value: string) => ({
          pass: true,
          type: `${value}!`,
        }),
      },
      { parsers: ['focusedAppend'] },
    );
    const seen: string[] = [];
    const suite = create(
      data => {
        seen.push(data.profile.label);
      },
      enforce.shape({
        profile: compose(enforce.shape({ label: enforce.focusedAppend() })),
        note: enforce.isString(),
      }),
    );

    await suite.changed('note').run({
      profile: { label: 'value' },
      note: 'changed',
    });

    expect(seen).toEqual(['value!']);
  });

  it('refreshes array mapping from raw input without applying parsers to parsed values', () => {
    enforce.extend(
      {
        focusedAppend: (value: string) => ({ pass: true, type: `${value}!` }),
      },
      { parsers: ['focusedAppend'] },
    );
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        test('rows.0', () => {
          enforce(data.rows[0]).equals('c!');
        });
      },
      enforce.shape({
        rows: enforce.isArrayOf(enforce.focusedAppend()),
      }),
    );
    suite.run({ rows: ['a', 'b'] });
    const changed = suite.changed('rows.0').run({ rows: ['c', 'b'] });
    expect(seen[1]).toEqual({ rows: ['c!', 'b!'] });
    expect(changed.isValid()).toBe(true);
    expect(changed.value).toEqual({ rows: ['c!', 'b!'] });
  });

  it('maps untouched fields before the first-ever focused callback without validating them', async () => {
    const validationCalls: unknown[] = [];
    const seenAges: number[] = [];
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      guard: enforce.condition((value: unknown): boolean => {
        validationCalls.push(value);
        return typeof value === 'string';
      }),
      note: enforce.isString(),
    });
    const suite = create(data => {
      seenAges.push(data.age);
    }, schema);

    await suite
      .changed('note')
      .run({ age: '42', guard: 'untouched', note: 'hello' });

    expect(seenAges).toEqual([42]);
    expect(validationCalls).toEqual([]);
  });

  it('maps explicitly registered custom parsers without running custom validators', async () => {
    const validationCalls: unknown[] = [];
    enforce.extend(
      {
        focusedToNumber: (value: unknown) => ({
          pass: true,
          type: Number(value),
        }),
        focusedValidator: (value: unknown) => {
          validationCalls.push(value);
          return true;
        },
      },
      { parsers: ['focusedToNumber'] },
    );
    const seenAges: number[] = [];
    const suite = create(
      data => {
        seenAges.push(data.age);
      },
      enforce.shape({
        age: enforce.focusedToNumber(),
        guard: enforce.focusedValidator(),
        note: enforce.isString(),
      }),
    );

    await suite
      .changed('note')
      .run({ age: '42', guard: 'untouched', note: 'hello' });

    expect(seenAges).toEqual([42]);
    expect(validationCalls).toEqual([]);
  });

  it('retains successful untouched transformations across sequential changed runs', async () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      quantity: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema);

    await suite.run({ age: '42', quantity: '1', note: 'a' });
    await suite.changed('note').run({ age: '42', quantity: '1', note: 'b' });
    await suite
      .changed('quantity')
      .run({ age: '42', quantity: '2', note: 'b' });

    expect(seen).toEqual([
      { age: 42, quantity: 1, note: 'a' },
      { age: 42, quantity: 1, note: 'b' },
      { age: 42, quantity: 2, note: 'b' },
    ]);
  });

  it('does not leak mapped values between suites created from the same callback', async () => {
    const seen: unknown[] = [];
    const callback = (data: unknown): void => {
      seen.push(data);
    };
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });
    const first = create(callback, schema);
    const second = create(callback, schema);

    await first.run({ age: '10', note: 'first' });
    await second.run({ age: '20', note: 'second' });
    await first.changed('note').run({ age: '10', note: 'first-next' });
    await second.changed('note').run({ age: '20', note: 'second-next' });

    expect(seen).toEqual([
      { age: 10, note: 'first' },
      { age: 20, note: 'second' },
      { age: 10, note: 'first-next' },
      { age: 20, note: 'second-next' },
    ]);
  });

  it('does not let a failing focused schema run poison the last successful mapping', async () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema);

    await suite.run({ age: '42', note: 'good' });

    const failed = await suite
      .changed('note')
      .run({ age: '42', note: 123 as unknown as string });
    expect(failed.isValid()).toBe(false);

    await suite.changed('note').run({ age: '42', note: 'recovered' });

    // Failed validation keeps the established raw-input callback fallback.
    // The next successful focused run must still recover the previously
    // transformed age rather than inheriting raw state from the failure.
    expect(seen).toEqual([
      { age: 42, note: 'good' },
      { age: '42', note: 123 },
      { age: 42, note: 'recovered' },
    ]);
  });

  it('does not resurrect a stale mapping after a failed full run', async () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
      },
      enforce.shape({
        age: enforce.isNumeric().toNumber(),
        state: enforce.isString(),
      }),
    );

    await suite.run({ age: '42', state: 'CA' });
    await suite.run({ age: '99', state: 123 as unknown as string });
    await suite.changed('state').run({ age: '99', state: 'NY' });

    expect(seen).toEqual([
      { age: 42, state: 'CA' },
      { age: '99', state: 123 },
      { age: 99, state: 'NY' },
    ]);
  });

  it('discards retained mapped callback data when the suite is reset', async () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
      },
      enforce.shape({
        age: enforce.isNumeric().toNumber(),
        note: enforce.isString(),
      }),
    );

    await suite.run({ age: '10', note: 'before' });
    suite.reset();
    await suite.changed('note').run({ age: '99', note: 'after' });

    expect(seen).toEqual([
      { age: 10, note: 'before' },
      { age: 99, note: 'after' },
    ]);
  });

  it('preserves the declared output type when an untouched parser fails during initial focused mapping', async () => {
    const seen: number[] = [];
    const suite = create(
      data => {
        seen.push(data.age);
        // The schema contract promises a number here even when the focused
        // field is elsewhere. This must never throw because raw input leaked
        // through the parser-only mapping path.
        data.age.toFixed();
      },
      enforce.shape({
        age: enforce.isNumeric().toNumber(),
        note: enforce.isString(),
      }),
    );

    await expect(
      suite.changed('note').run({ age: 'not-numeric', note: 'ok' }),
    ).resolves.toBeDefined();
    expect(seen).toHaveLength(1);
    expect(Number.isNaN(seen[0])).toBe(true);
  });

  it('keeps only() exact while retaining untouched successful mappings', async () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      quantity: enforce.isNumeric().toNumber(),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema);

    await suite.run({ age: '42', quantity: '1' });
    await suite.only('quantity').run({ age: '42', quantity: '2' });

    expect(seen).toEqual([
      { age: 42, quantity: 1 },
      { age: 42, quantity: 2 },
    ]);
  });

  it('maps skipped parser fields on a first-ever skip-only run', async () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push({ ...data });
      },
      enforce.shape({
        a: enforce.isNumeric().toNumber(),
        b: enforce.isNumeric().toNumber(),
      }),
    );

    await suite.focus({ skip: 'b' }).run({ a: '1', b: '2' });

    // `b` was omitted from schema execution: the callback must still observe
    // the parsed value, never the raw input string.
    expect(seen).toEqual([{ a: 1, b: 2 }]);
  });

  it('retains parsed skipped values across skip-only runs', async () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push({ ...data });
      },
      enforce.shape({
        a: enforce.isNumeric().toNumber(),
        b: enforce.isNumeric().toNumber(),
      }),
    );

    await suite.focus({ skip: 'b' }).run({ a: '1', b: '2' });
    await suite.focus({ skip: 'b' }).run({ a: '3', b: '4' });

    expect(seen).toEqual([
      { a: 1, b: 2 },
      { a: 3, b: 2 },
    ]);
  });
});
