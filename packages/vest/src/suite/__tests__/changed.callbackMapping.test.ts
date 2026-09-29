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

describe('focused callback input snapshots', () => {
  it('keeps unselected composed parser input unchanged', async () => {
    enforce.extend({
      focusedAppend: (value: string) => ({
        pass: true,
        type: `${value}!`,
      }),
    });
    const seen: Array<string | undefined> = [];
    const suite = create(
      data => {
        seen.push(data.profile?.label);
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

    expect(seen).toEqual(['value']);
  });

  it('refreshes array mapping from raw input without applying parsers to parsed values', () => {
    enforce.extend({
      focusedAppend: (value: string) => ({ pass: true, type: `${value}!` }),
    });
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        test('rows.0', () => {
          enforce(data.rows?.[0]).equals('c');
        });
      },
      enforce.shape({
        rows: enforce.isArrayOf(enforce.focusedAppend()),
      }),
    );
    suite.run({ rows: ['a', 'b'] });
    const changed = suite.changed('rows.0').run({ rows: ['c', 'b'] });
    expect(seen[1]).toEqual({ rows: ['c', 'b'] });
    expect(changed.isValid()).toBe(true);
    expect(changed.value).toStrictEqual({
      rows: Object.assign(new Array(2), { 0: 'c!' }),
    });
  });

  it('supplies untouched input without parsing or validating it', async () => {
    const validationCalls: unknown[] = [];
    const seenAges: unknown[] = [];
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

    expect(seenAges).toEqual(['42']);
    expect(validationCalls).toEqual([]);
  });

  it('keeps custom parser input unchanged outside selection', async () => {
    const validationCalls: unknown[] = [];
    enforce.extend({
      focusedToNumber: (value: unknown) => ({
        pass: true,
        type: Number(value),
      }),
      focusedValidator: (value: unknown) => {
        validationCalls.push(value);
        return true;
      },
    });
    const seenAges: unknown[] = [];
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

    expect(seenAges).toEqual(['42']);
    expect(validationCalls).toEqual([]);
  });

  it('supplies each snapshot across sequential changed runs', async () => {
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

    // A passing full run receives complete parsed output; focused runs
    // receive their supplied input.
    expect(seen).toEqual([
      { age: 42, quantity: 1, note: 'a' },
      { age: '42', quantity: '1', note: 'b' },
      { age: '42', quantity: '2', note: 'b' },
    ]);
  });

  it('isolates input snapshots between suites sharing a callback', async () => {
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
      { age: '10', note: 'first-next' },
      { age: '20', note: 'second-next' },
    ]);
  });

  it('supplies current input before, during, and after a focused failure', async () => {
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

    // Focused callbacks observe this invocation's input, including failures.
    expect(seen).toEqual([
      { age: 42, note: 'good' },
      { age: '42', note: 123 },
      { age: '42', note: 'recovered' },
    ]);
  });

  it('supplies current input after a failed full run', async () => {
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

    // A failed full run falls back to its current input.
    expect(seen).toEqual([
      { age: 42, state: 'CA' },
      { age: '99', state: 123 },
      { age: '99', state: 'NY' },
    ]);
  });

  it('supplies current input after reset', async () => {
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
      { age: '99', note: 'after' },
    ]);
  });

  it('leaves invalid unselected parser input available for guarded declaration', async () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data.age);
        // Callback input requires narrowing before output-only operations.
        if (typeof data.age === 'number') data.age.toFixed();
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
    expect(seen[0]).toBe('not-numeric');
  });

  it('keeps only() exact and callback input current', async () => {
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
      // only() applies this run's parsed focus onto the supplied input.
      { age: '42', quantity: 2 },
    ]);
  });

  it('keeps skipped fields raw on a first skip-only run', async () => {
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

    // Skipped values remain input data; selected values are parsed.
    expect(seen).toEqual([{ a: 1, b: '2' }]);
  });

  it('refreshes raw skipped values across skip-only runs', async () => {
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
      { a: 1, b: '2' },
      { a: 3, b: '4' },
    ]);
  });

  it('supplies current array input without stale retained members', async () => {
    // A parser-mapped member is indistinguishable from raw input by value
    // alone (trim('new') === 'new'), so mapping provenance decides: the
    // current run parsed index 1, and its output wins over the previous
    // run's mapping of different input.
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString().trim()),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('x', () => true);
    }, schema);
    await suite.run({ rows: ['a', ' old '] });
    const result = await suite.changed('rows.0').run({ rows: ['b', 'new'] });

    expect(result.isValid()).toBe(true);
    expect(seen[seen.length - 1]).toEqual({ rows: ['b', 'new'] });
  });

  it('does not resurrect a removed optional parent from descendant merges', async () => {
    // An affected ancestor subsumes its descendant merge paths: merging
    // 'profile' deletes it, and a later 'profile.name' merge must not
    // recreate it as an empty object.
    const schema = enforce.partial({
      profile: enforce.shape({ name: enforce.isString() }),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('x', () => true);
    }, schema);
    await suite.run({ profile: { name: 'x' } });
    const result = await suite.changed('profile').run({});

    expect(result.isValid()).toBe(true);
    expect(seen[seen.length - 1]).toEqual({});
  });
});
