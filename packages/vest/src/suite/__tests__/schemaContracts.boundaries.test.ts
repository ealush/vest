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
});
