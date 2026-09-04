import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      focusedToNumber: (value: unknown) => { pass: boolean; type: number };
      focusedValidator: (value: unknown) => boolean;
    }
  }
}

describe('focused schema callback mapping', () => {
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
});
