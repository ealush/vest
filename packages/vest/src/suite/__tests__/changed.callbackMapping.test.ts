import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create } from '../../vest';

describe('focused schema callback mapping', () => {
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
