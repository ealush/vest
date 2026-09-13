import { describe, expect, it, vi } from 'vitest';
import { compose, enforce } from 'n4s';
import { resolveAffectedPaths } from 'n4s/exports/internal';

import { create, test } from '../../vest';
import { cloneDataTree } from '../cloneDataTree';

const union = () =>
  enforce.isArrayOf(enforce.isNumeric().toNumber(), enforce.isBoolean());
const shape = () => enforce.shape({ rows: union(), note: enforce.isString() });

describe('schema contracts: mapping and snapshot boundaries', () => {
  it('concrete array-index planning does not invoke an accessor', () => {
    const getter = vi.fn(() => 'value');
    const rows: string[] = [];
    Object.defineProperty(rows, '0', { get: getter, enumerable: true });
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString()),
    });
    expect(resolveAffectedPaths(schema, ['rows.0'], { rows })).toEqual([
      'rows.0',
    ]);
    expect(getter).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'SharedArrayBuffer view remains detached (immutable=%s)',
    immutable => {
      const buffer = new SharedArrayBuffer(8);
      const raw = {
        bytes: new Uint8Array(buffer, 2, 4),
        view: new DataView(buffer, 3, 2),
      };
      raw.bytes[1] = 7;
      const copy = cloneDataTree(raw, immutable) as typeof raw;
      copy.bytes[1] = 9;
      expect(raw.bytes[1]).toBe(7);
      expect(copy.view.getUint8(0)).toBe(9);
      expect(copy.bytes.buffer).not.toBe(buffer);
    },
  );

  it.each(
    [false, true].flatMap(immutable =>
      [false, true].flatMap(shared =>
        [false, true].map(bufferFirst => ({ immutable, shared, bufferFirst })),
      ),
    ),
  )(
    'preserves buffer cycles (immutable=$immutable shared=$shared bufferFirst=$bufferFirst)',
    ({ immutable, shared, bufferFirst }) => {
      const buffer = shared ? new SharedArrayBuffer(8) : new ArrayBuffer(8);
      const bytes = new Uint8Array(buffer, 2, 4);
      const view = new DataView(buffer, 3, 2);
      Object.defineProperty(bytes.buffer, 'owner', {
        value: bytes,
        configurable: true,
      });
      Object.defineProperty(buffer, 'view', { value: view });
      const raw = bufferFirst
        ? { buffer, bytes, view }
        : { bytes, view, buffer };
      const copy = cloneDataTree(raw, immutable) as typeof raw;
      expect(
        (copy.bytes.buffer as ArrayBuffer & { owner: Uint8Array }).owner,
      ).toBe(copy.bytes);
      expect((copy.buffer as ArrayBuffer & { view: DataView }).view).toBe(
        copy.view,
      );
      expect(copy.bytes.buffer).toBe(copy.buffer);
      expect(copy.view.buffer).toBe(copy.buffer);
      expect(copy.buffer).not.toBe(buffer);
      expect(copy.bytes.byteOffset).toBe(2);
      expect(copy.bytes.length).toBe(4);
      expect(copy.view.byteOffset).toBe(3);
      expect(copy.view.byteLength).toBe(2);
    },
  );

  it('composition cannot deliver an unparsed union as complete callback output', () => {
    let seen: unknown;
    const suite = create(data => {
      seen = data;
      test('note', () => true);
    }, compose(shape()));
    expect(() =>
      suite.changed('note').run({ rows: ['2'], note: 'ok' }),
    ).toThrow(/Focused schema mapping/);
    expect(seen).toBeUndefined();
    suite.run({ rows: ['2'], note: 'ok' });
    expect(
      suite.changed('note').run({ rows: ['3'], note: 'new' }).value,
    ).toEqual({ rows: [2], note: 'new' });
  });

  it('skip-only focus cannot deliver an unparsed skipped union as complete output', () => {
    let seen: unknown;
    const suite = create(data => {
      seen = data;
      test('note', () => true);
    }, shape());
    expect(() =>
      suite.focus({ skip: 'rows' }).run({ rows: ['2'], note: 'ok' }),
    ).toThrow(/mapping|union|focused/i);
    expect(seen).toBeUndefined();
  });

  it('skip cannot seed a witness that allows a later changed run to claim parsed union output', () => {
    const suite = create(() => {
      test('note', () => true);
    }, shape());
    expect(() =>
      suite.focus({ skip: 'rows' }).run({ rows: ['2'], note: 'ok' }),
    ).toThrow(/Focused schema mapping/);
    expect(() =>
      suite.changed('note').run({ rows: ['2'], note: 'new' }),
    ).toThrow(/mapping|union|focused/i);
    expect(suite.run({ rows: ['2'], note: 'ok' }).value).toEqual({
      rows: [2],
      note: 'ok',
    });
    expect(
      suite.focus({ skip: 'rows' }).run({ rows: ['3'], note: 'new' }).value,
    ).toEqual({ rows: [2], note: 'new' });
  });

  it('empty focus does not promote raw union input into a later branch witness', () => {
    const suite = create(() => {
      test('note', () => true);
    }, shape());
    suite.changed([]).run({ rows: ['2'], note: 'ok' });
    expect(() =>
      suite.changed('note').run({ rows: ['2'], note: 'new' }),
    ).toThrow(/Focused schema mapping/);
    suite.run({ rows: ['2'], note: 'ok' });
    suite.changed([]).run({ rows: ['3'], note: 'ignored' });
    expect(
      suite.changed('note').run({ rows: ['3'], note: 'new' }).value,
    ).toEqual({ rows: [2], note: 'new' });
  });

  it('skip of an unrelated field keeps the validated union output', () => {
    const suite = create(() => {
      test('rows', () => true);
    }, shape());
    expect(
      suite.focus({ skip: 'note' }).run({ rows: ['2'], note: 'ok' }).value,
    ).toEqual({ rows: [2], note: 'ok' });
  });

  it('[SC-BOUNDARY-COPY] throwing getter fails the run without partial publication', () => {
    const getterError = new Error('getter boom');
    let armed = false;
    const calls: string[] = [];
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        for (const field of ['payload', 'other'] as const) {
          test(field, () => {
            calls.push(field);
            return true;
          });
        }
      },
      enforce.shape({
        payload: enforce.condition((value: unknown) => value !== null),
        other: enforce.isString(),
      }),
    );
    const input: Record<string, unknown> = { other: 'ok' };
    Object.defineProperty(input, 'payload', {
      enumerable: true,
      get: () => {
        if (armed) throw getterError;
        return { nested: 1 };
      },
    });

    const valid = suite.run(input as never);
    expect(valid.isValid()).toBe(true);
    // Save the actual delivered references: inspecting these after the
    // failure catches in-place corruption that a serialized copy would miss.
    const deliveredValue = valid.value as Record<string, unknown>;
    const deliveredCallback = seen[0] as Record<string, unknown>;

    // A derived builder created before the failure keeps its intentional
    // focus; the failure must not clear it (no automatic clearing).
    const derived = suite.changed('other');
    // Skip the throwing field so validation succeeds and the failure lands
    // in the boundary copy, not in validation.
    armed = true;
    calls.length = 0;
    let thrown: unknown;
    try {
      suite
        .changed('other')
        .focus({ skip: 'payload' })
        .run(input as never);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(getterError);
    expect(seen).toHaveLength(1);

    // Atomicity on the delivered references themselves.
    expect(deliveredValue).toEqual({ other: 'ok', payload: { nested: 1 } });
    expect(deliveredCallback).toEqual({
      other: 'ok',
      payload: { nested: 1 },
    });
    // No partial publication is observable through the suite either.
    expect(suite.get().hasErrors()).toBe(false);
    expect(suite.get().tests.payload.testCount).toBe(1);
    expect(suite.get().tests.other.testCount).toBe(1);

    // Recovery: the base suite is uncontaminated and the pre-derived
    // builder retains its focus.
    armed = false;
    calls.length = 0;
    const recovery = suite.run({ other: 'next', payload: { nested: 2 } });
    expect(calls.sort()).toEqual(['other', 'payload']);
    expect(recovery.isValid()).toBe(true);
    expect(recovery.value).toEqual({ other: 'next', payload: { nested: 2 } });
    calls.length = 0;
    const refocused = derived.run({ other: 'again', payload: { nested: 3 } });
    expect(calls).toEqual(['other']);
    expect(refocused.hasErrors('payload')).toBe(false);
  });

  it('[SC-BOUNDARY-COPY] boundary failure leaves earlier async work pending and clean', async () => {
    const gate = (() => {
      let release: () => void = () => {};
      const promise = new Promise<void>(resolve => {
        release = resolve;
      });
      return { promise, release };
    })();
    const flush = () => new Promise<void>(resolve => setImmediate(resolve));
    const getterError = new Error('getter boom');
    let armed = false;
    const callbacks: unknown[] = [];
    const suite = create(
      data => {
        callbacks.push(data);
        test('asy', async () => {
          await gate.promise;
        });
        test('other', () => true);
      },
      enforce.shape({
        payload: enforce.condition((value: unknown) => value !== null),
        other: enforce.isString(),
        asy: enforce.isString(),
      }),
    );
    const input: Record<string, unknown> = {
      other: 'ok',
      asy: 'ok',
    };
    Object.defineProperty(input, 'payload', {
      enumerable: true,
      get: () => {
        if (armed) throw getterError;
        return { nested: 1 };
      },
    });

    const first = suite.run(input as never);
    expect(first.isPending()).toBe(true);

    armed = true;
    let thrown: unknown;
    try {
      suite
        .changed('other')
        .focus({ skip: 'payload' })
        .run(input as never);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(getterError);
    // The earlier run is still live and nothing new was published.
    expect(first.isPending()).toBe(true);
    expect(suite.get().isPending()).toBe(true);
    expect(callbacks).toHaveLength(1);

    gate.release();
    const settled = await first;
    await flush();
    expect(settled.hasErrors()).toBe(false);
    expect(suite.get().isPending()).toBe(false);
    // Settlement publishes the pending verdict without re-invoking the
    // suite callback: exactly one publication for one run.
    expect(callbacks).toHaveLength(1);
  });
});
