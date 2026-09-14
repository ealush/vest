import { describe, expect, it, vi } from 'vitest';
import { compose, enforce } from 'n4s';

import { invokeWithUnknown } from '../../__tests__/runtimeTestUtils';
import { create, test } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      contractEmit: (
        value: unknown,
        output: unknown,
      ) => { pass: boolean; type: unknown };
      contractSuffix: (value: string) => { pass: boolean; type: string };
      matrixSuffix: (value: string) => { pass: boolean; type: string };
      matrixFailEmit: (value: string) => { pass: boolean; type: string };
    }
  }
}
enforce.extend(
  {
    contractEmit: (_value: unknown, output: unknown) => ({
      pass: true,
      type: output,
    }),
    contractSuffix: (value: string) => ({ pass: true, type: `${value}!` }),
    matrixSuffix: (value: string) => ({ pass: true, type: `${value}!` }),
    matrixFailEmit: (value: string) =>
      value === 'bad'
        ? { pass: false, type: 'MAPPED' }
        : { pass: true, type: value },
  },
  {
    parsers: [
      'contractEmit',
      'contractSuffix',
      'matrixSuffix',
      'matrixFailEmit',
    ],
  },
);

const outputs = [
  { name: 'null', value: null },
  { name: 'undefined', value: undefined },
  { name: 'false', value: false },
  { name: 'zero', value: 0 },
  { name: 'empty', value: '' },
];
const placements = ['root', 'shape', 'array', 'tuple', 'compose'] as const;

describe('schema contracts: parsed output matrix', () => {
  it.each(
    outputs.flatMap(output =>
      placements.map(placement => ({ ...output, placement })),
    ),
  )('[SC-OUTPUT] preserves $name at $placement', ({ value, placement }) => {
    const rule = enforce.contractEmit(value);
    const schema =
      placement === 'shape'
        ? enforce.shape({ v: rule })
        : placement === 'array'
          ? enforce.isArrayOf(rule)
          : placement === 'tuple'
            ? enforce.tuple(rule)
            : placement === 'compose'
              ? compose(rule)
              : rule;
    const raw =
      placement === 'shape'
        ? { v: 'raw' }
        : placement === 'array' || placement === 'tuple'
          ? ['raw']
          : 'raw';
    const expected =
      placement === 'shape'
        ? { v: value }
        : placement === 'array' || placement === 'tuple'
          ? [value]
          : value;
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('marker', () => true);
    }, schema);
    const result = invokeWithUnknown(suite.run, raw);
    expect(invokeWithUnknown(schema.run, raw)).toEqual(
      expect.objectContaining({ pass: true, type: expected }),
    );
    expect(result.isValid()).toBe(true);
    expect(seen).toStrictEqual([expected]);
    expect(result.value).toStrictEqual(expected);
    expect(result.run.data.parsed).toStrictEqual(expected);
    if (placement === 'shape')
      expect(Object.hasOwn(result.value as object, 'v')).toBe(true);
    if (placement === 'array' || placement === 'tuple')
      expect(Object.hasOwn(result.value as object, '0')).toBe(true);
  });

  it.each(['fresh', 'warm', 'reorder', 'insert', 'remove'] as const)(
    '[SC-UNION] complete union mapping after %s focused update',
    state => {
      const schema = enforce.shape({
        rows: enforce.isArrayOf(
          enforce.isNumeric().toNumber(),
          enforce.isBoolean(),
        ),
      });
      const seen: unknown[] = [];
      const suite = create(data => {
        seen.push(data);
        test('rows.0', () => true);
      }, schema);
      if (state !== 'fresh') suite.run({ rows: ['1', true, '3'] });
      const rows =
        state === 'reorder'
          ? ['3', '1', true]
          : state === 'insert'
            ? ['9', '1', true, '3']
            : state === 'remove'
              ? ['1', '3']
              : ['2', true, '3'];
      const changed = ['reorder', 'insert', 'remove'].includes(state)
        ? 'rows'
        : 'rows.0';
      if (state === 'fresh') {
        // V1 limitation (documented in schema_relationships.md): a first
        // focused run over an untouched union has no branch witness, and no
        // predicate-free rule can select the validation branch (e.g. a
        // numeric parser succeeds on booleans the validator rejects). The
        // run fails explicitly instead of emitting raw input under the
        // schema-output type. A prior full run establishes the witness that
        // the warm states below reuse.
        expect(() => suite.changed(changed).run({ rows })).toThrow(
          /mapping|focused|union/i,
        );
        expect(seen).toEqual([]);
        return;
      }
      const result = suite.changed(changed).run({ rows });
      const expected = {
        rows: rows.map(value =>
          typeof value === 'string' ? Number(value) : value,
        ),
      };
      expect(result.isValid()).toBe(true);
      expect(seen.at(-1)).toEqual(expected);
      expect(result.value).toStrictEqual(expected);
    },
  );

  it('[SC-UNION] evaluates alternatives in order and does not rerun the winner for its output', () => {
    const first = vi.fn(() => false);
    const second = vi.fn(() => true);
    const never = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.condition(first),
        enforce.condition(second).contractSuffix(),
        enforce.condition(never),
      ),
    });
    const suite = create(() => {
      test('rows.0', () => true);
    }, schema);
    const result = suite.changed('rows.0').run({ rows: ['v'] });
    expect(result.value).toEqual({ rows: ['v!'] });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(never).not.toHaveBeenCalled();
  });

  it('[SC-PARSER] a pure non-idempotent parser is applied to raw values, never to previously parsed values', () => {
    const suite = create(
      () => {
        test('rows.0', () => true);
      },
      enforce.shape({ rows: enforce.isArrayOf(enforce.contractSuffix()) }),
    );
    suite.run({ rows: ['a', 'b'] });
    expect(suite.changed('rows.0').run({ rows: ['c', 'b'] }).value).toEqual({
      rows: ['c!', 'b!'],
    });
    expect(suite.changed('rows.0').run({ rows: ['d', 'b'] }).value).toEqual({
      rows: ['d!', 'b!'],
    });
  });

  it('[SC-PRESENCE] deletion and explicit undefined remain distinct through focused mapping', () => {
    const schema = enforce.partial({
      a: enforce.contractEmit(undefined),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('a', () => true);
      test('b', () => true);
    }, schema);
    suite.run({ a: 'input', b: 'ok' });
    expect(Object.hasOwn(seen[0] as object, 'a')).toBe(true);
    suite.changed('a').run({ b: 'ok' });
    expect(Object.hasOwn(seen[1] as object, 'a')).toBe(false);
    suite.changed('a').run({ a: undefined, b: 'ok' });
    expect(Object.hasOwn(seen[2] as object, 'a')).toBe(true);
  });

  it('[SC-PRESENCE] first skip-only mapping preserves a present undefined parser output', () => {
    let seen: unknown;
    const suite = create(
      data => {
        seen = data;
        test('a', () => true);
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.contractEmit(undefined),
      }),
    );

    suite.focus({ skip: 'b' }).run({ a: 'ok', b: 'input' });

    expect(seen).toEqual({ a: 'ok', b: undefined });
    expect(Object.hasOwn(seen as object, 'b')).toBe(true);
  });

  it('[SC-FAILURE-MAP] failed focused validation cannot poison the retained successful parser mapping', () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        test('note', () => true);
      },
      enforce.shape({
        n: enforce.isNumeric().toNumber(),
        note: enforce.isString().isNotBlank(),
      }),
    );
    suite.run({ n: '42', note: 'ok' });
    const invalid = suite.changed('note').run({ n: '42', note: '' });
    expect(invalid.isValid()).toBe(false);
    expect(invalid.value).toBeUndefined();
    expect(seen[1]).toEqual({ n: 42, note: '' });
    const repaired = suite.changed('note').run({ n: '42', note: 'fixed' });
    expect(repaired.value).toEqual({ n: 42, note: 'fixed' });
  });
});

describe('schema contracts: parser mapping matrix (EX08b)', () => {
  // Nested parsers (a parser chained after a parser) and custom registered
  // parsers under exclusion: mapping stays honest while excluded validation
  // stays at zero. A trailing composed condition observes validation
  // execution only — pure parser mapping never runs it.
  it('[SC-PARSER-MATRIX] nested built-in parsers on a skipped field map honestly from retention', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      deep: compose(
        enforce.isNumeric().toNumber().clamp(0, 120),
        enforce.condition(validated),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('note', () => true);
    }, schema as never);
    const full = suite.run({ deep: '90', note: 'first' });
    expect(full.isValid()).toBe(true);
    expect(seen[0]).toEqual({ deep: 90, note: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);

    validated.mockClear();
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'deep' })
      .run({ deep: '50', note: 'second' });

    expect(result.hasErrors()).toBe(false);
    // Both parser stages map honestly, but from the retained run ('90'):
    // the skipped field is never revalidated and never remapped from raw.
    expect(seen[0]).toEqual({ deep: 90, note: 'second' });
    expect(validated).not.toHaveBeenCalled();
  });

  it('[SC-PARSER-MATRIX] nested built-in parsers on a selected field validate exactly once with fresh output', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      deep: compose(
        enforce.isNumeric().toNumber().clamp(0, 120),
        enforce.condition(validated),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('note', () => true);
    }, schema as never);
    suite.run({ deep: '90', note: 'first' });
    validated.mockClear();
    seen.length = 0;
    const result = suite.changed('deep').run({ deep: '70', note: 'first' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ deep: 70, note: 'first' });
    // No retry-as-probe: the trailing validator runs exactly once.
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-PARSER-MATRIX] nested custom parsers on a skipped field map honestly without validation', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      a: compose(
        enforce.isString().matrixSuffix().matrixSuffix(),
        enforce.condition(validated),
      ),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ a: 'x', b: 'ok' });
    expect(seen[0]).toEqual({ a: 'x!!', b: 'ok' });

    validated.mockClear();
    seen.length = 0;
    const result = suite
      .changed('b')
      .focus({ skip: 'a' })
      .run({ a: 'y', b: 'ok2' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'x!!', b: 'ok2' });
    expect(validated).not.toHaveBeenCalled();
  });

  it('[SC-PARSER-MATRIX] nested custom parsers on a selected field validate exactly once', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      a: compose(
        enforce.isString().matrixSuffix().matrixSuffix(),
        enforce.condition(validated),
      ),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ a: 'x', b: 'ok' });
    validated.mockClear();
    seen.length = 0;
    const result = suite.changed('a').run({ a: 'z', b: 'ok' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'z!!', b: 'ok' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-PARSER-MATRIX] a skipped custom parser maps its declared output even when validation would fail', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      custom: compose(
        enforce.isString().matrixFailEmit(),
        enforce.condition(validated),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ custom: 'good', note: 'first' });
    expect(seen[0]).toEqual({ custom: 'good', note: 'first' });

    validated.mockClear();
    seen.length = 0;
    // 'bad' fails the custom parser's own verdict, but the field is
    // excluded: its declared output maps honestly without validation.
    const result = suite
      .changed('note')
      .focus({ skip: 'custom' })
      .run({ custom: 'bad', note: 'second' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ custom: 'good', note: 'second' });
    expect(validated).not.toHaveBeenCalled();
  });

  it('[SC-PARSER-MATRIX] an array member parser with an index skip reuses retention without validation', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        compose(enforce.isNumeric().toNumber(), enforce.condition(validated)),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ rows: ['1', '2'], note: 'first' });
    expect(seen[0]).toEqual({ rows: [1, 2], note: 'first' });

    validated.mockClear();
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'rows.0' })
      .run({ rows: ['9', '2'], note: 'second' });

    expect(result.hasErrors()).toBe(false);
    // The excluded index maps from retention (1, not fresh 9); the sibling
    // keeps its parsed value and no excluded validation runs.
    expect(seen[0]).toEqual({ rows: [1, 2], note: 'second' });
    expect(validated).not.toHaveBeenCalled();
  });
});
