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
      exclBeforeCount: (value: string) => { pass: boolean; type: string };
      exclAfterCount: (value: string) => { pass: boolean; type: string };
      contractTap: (value: unknown) => boolean;
    }
  }
}
enforce.extend({
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
  exclBeforeCount: (value: string) => {
    exclBeforeCalls += 1;
    return { pass: true, type: `${value}<` };
  },
  exclAfterCount: (value: string) => {
    exclAfterCalls += 1;
    return { pass: true, type: `${value}>` };
  },
  contractTap: () => {
    contractTapCalls += 1;
    return true;
  },
});

let exclBeforeCalls = 0;
let exclAfterCalls = 0;
let contractTapCalls = 0;

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
    // compose() validates the original input and returns it unchanged.
    const expected =
      placement === 'shape'
        ? { v: value }
        : placement === 'array' || placement === 'tuple'
          ? [value]
          : placement === 'compose'
            ? raw
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
    // A passing full run hands the callback its complete parsed output.
    expect(seen).toStrictEqual([expected]);
    expect(result.value).toStrictEqual(expected);
    expect(result.run.data.parsed).toStrictEqual(expected);
    if (placement === 'shape')
      expect(Object.hasOwn(result.value as object, 'v')).toBe(true);
    if (placement === 'array' || placement === 'tuple')
      expect(Object.hasOwn(result.value as object, '0')).toBe(true);
  });

  it.each(['fresh', 'warm', 'reorder', 'insert', 'remove'] as const)(
    '[SC-UNION] selected union output after %s focused update',
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
      const result = suite.changed(changed).run({ rows });
      const expected = {
        rows: rows.map(value =>
          typeof value === 'string' ? Number(value) : value,
        ),
      };
      expect(result.isValid()).toBe(true);
      if (changed === 'rows.0') {
        expected.rows = Object.assign(new Array(rows.length), {
          0: Number(rows[0]),
        });
      }
      expect(seen.at(-1)).toEqual({ rows });
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
      rows: Object.assign(new Array(2), { 0: 'c!' }),
    });
    expect(suite.changed('rows.0').run({ rows: ['d', 'b'] }).value).toEqual({
      rows: Object.assign(new Array(2), { 0: 'd!' }),
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

  it('[SC-PRESENCE] skip-only callbacks retain supplied input without parsing the skipped field', () => {
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

    expect(seen).toEqual({ a: 'ok', b: 'input' });
    expect(Object.hasOwn(seen as object, 'b')).toBe(true);
  });

  it('[SC-FAILURE-MAP] failed focused validation exposes no output and later runs use current evidence', () => {
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
    expect(seen[1]).toEqual({ n: '42', note: '' });
    const repaired = suite.changed('note').run({ n: '42', note: 'fixed' });
    expect(repaired.value).toEqual({ note: 'fixed' });
  });
});

describe('schema contracts: selected parser execution matrix (EX08b)', () => {
  it('[SC-PARSER-MATRIX] nested built-in parsers on a skipped field leave callback input unchanged', () => {
    const schema = enforce.shape({
      deep: enforce.isNumeric().toNumber().clamp(0, 120).contractTap(),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('note', () => true);
    }, schema as never);
    contractTapCalls = 0;
    const full = suite.run({ deep: '90', note: 'first' });
    expect(full.isValid()).toBe(true);
    expect(seen[0]).toEqual({ deep: 90, note: 'first' });
    expect(contractTapCalls).toBe(1);

    contractTapCalls = 0;
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'deep' })
      .run({ deep: '50', note: 'second' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ deep: '50', note: 'second' });
    expect(contractTapCalls).toBe(0);
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
    expect(seen[0]).toEqual({ deep: '70', note: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-PARSER-MATRIX] nested custom parsers on a skipped field stay idle outside selection', () => {
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
    expect(seen[0]).toEqual({ a: 'x', b: 'ok' });

    validated.mockClear();
    seen.length = 0;
    const result = suite
      .changed('b')
      .focus({ skip: 'a' })
      .run({ a: 'y', b: 'ok2' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'y', b: 'ok2' });
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
    expect(seen[0]).toEqual({ a: 'z', b: 'ok' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-PARSER-MATRIX] a skipped custom parser does not run even when its input would fail', () => {
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
    const result = suite
      .changed('note')
      .focus({ skip: 'custom' })
      .run({ custom: 'bad', note: 'second' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ custom: 'bad', note: 'second' });
    expect(validated).not.toHaveBeenCalled();
  });

  it('[SC-PARSER-MATRIX] an array member parser with an index skip does not execute', () => {
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
    expect(seen[0]).toEqual({ rows: ['1', '2'], note: 'first' });

    validated.mockClear();
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'rows.0' })
      .run({ rows: ['9', '2'], note: 'second' });

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ rows: ['9', '2'], note: 'second' });
    expect(validated).not.toHaveBeenCalled();
  });
});

describe('schema contracts: parser before/after container with skip (T1 parser placement)', () => {
  it('[SC-PARSER-CONTAINER] toNumber on a skipped field stays idle with zero validation', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      age: compose(
        enforce.isNumeric().toNumber(),
        enforce.condition(validated),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
    }, schema as never);
    const full = suite.run({ age: '42', note: 'first' } as never);
    expect(full.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ age: '42', note: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);

    validated.mockClear();
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'age' })
      .run({ age: '43', note: 'second' } as never);

    expect(result.hasErrors()).toBe(false);
    expect(result.hasErrors('age')).toBe(false);
    expect(seen[0]).toEqual({ age: '43', note: 'second' });
    expect(validated).not.toHaveBeenCalled();
  });

  it('[SC-PARSER-CONTAINER] toNumber on a selected field validates once with fresh output', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      age: compose(
        enforce.isNumeric().toNumber(),
        enforce.condition(validated),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
    }, schema as never);
    suite.run({ age: '42', note: 'first' } as never);
    validated.mockClear();
    seen.length = 0;

    const result = suite
      .changed('age')
      .run({ age: '43', note: 'first' } as never);

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ age: '43', note: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-PARSER-CONTAINER] custom parsers before/after on a skipped field stay idle with explicit counts', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      deep: compose(
        (enforce as any).isString().exclBeforeCount().exclAfterCount(),
        enforce.condition(validated),
      ),
      note: (enforce as any).isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
    }, schema as never);
    exclBeforeCalls = 0;
    exclAfterCalls = 0;
    suite.run({ deep: 'x', note: 'first' } as never);
    expect(seen[0]).toEqual({ deep: 'x', note: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);
    expect(exclBeforeCalls).toBe(1);
    expect(exclAfterCalls).toBe(1);

    validated.mockClear();
    exclBeforeCalls = 0;
    exclAfterCalls = 0;
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'deep' })
      .run({ deep: 'y', note: 'second' } as never);

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ deep: 'y', note: 'second' });
    expect(validated).not.toHaveBeenCalled();
    expect(exclBeforeCalls).toBe(0);
    expect(exclAfterCalls).toBe(0);
  });

  it('[SC-PARSER-CONTAINER] custom parsers before/after on a selected field validate once with fresh output', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      deep: compose(
        (enforce as any).isString().exclBeforeCount().exclAfterCount(),
        enforce.condition(validated),
      ),
      note: (enforce as any).isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
    }, schema as never);
    suite.run({ deep: 'x', note: 'first' } as never);
    validated.mockClear();
    seen.length = 0;

    const result = suite
      .changed('deep')
      .run({ deep: 'z', note: 'first' } as never);

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ deep: 'z', note: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);
  });
});

describe('schema contracts: MP04b supported parser combinations', () => {
  it.each([
    { name: 'null', value: null },
    { name: 'undefined', value: undefined },
    { name: 'false', value: false },
    { name: 'zero', value: 0 },
    { name: 'empty', value: '' },
  ])(
    '[SC-MP04b-OUTPUT] $name parser output keeps input and output distinct under focus',
    ({ value }) => {
      const rule = (enforce as any).contractEmit(value).contractTap();
      const schema = enforce.shape({
        v: rule,
        note: enforce.isString(),
      });
      const seen: unknown[] = [];
      const suite = create((_data: unknown) => {
        seen.push(_data);
        test('marker', () => true);
      }, schema as never);
      const full = suite.run({ v: 'raw', note: 'first' } as never);
      expect(full.hasErrors()).toBe(false);
      expect(full.value).toEqual({ v: value, note: 'first' });
      expect(seen[0]).toEqual({ v: value, note: 'first' });

      seen.length = 0;
      const focused = suite
        .changed('v')
        .run({ v: 'fresh', note: 'first' } as never);

      expect(focused.hasErrors()).toBe(false);
      expect(seen[0]).toEqual({ v: 'fresh', note: 'first' });
      expect(focused.value).toEqual({ v: value });
      expect((focused as any).run.data.parsed).toEqual({
        v: value,
      });
      if (value === undefined)
        expect(Object.hasOwn(seen[0] as object, 'v')).toBe(true);
    },
  );

  it('[SC-MP04b-NESTED] nested parsers keep parity on a selected field', () => {
    const schema = enforce.shape({
      deep: enforce.isNumeric().toNumber().clamp(0, 120).contractTap(),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
      test('marker', () => true);
    }, schema as never);
    suite.run({ deep: '90', note: 'first' } as never);
    contractTapCalls = 0;
    seen.length = 0;

    const result = suite
      .changed('deep')
      .run({ deep: '70', note: 'first' } as never);

    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ deep: '70', note: 'first' });
    expect(result.value).toEqual({ deep: 70 });
    expect(contractTapCalls).toBe(1);
  });

  it('[SC-MP04b-COMPOSED] opaque root composition rejects focused execution', () => {
    const validated = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        a: compose(
          (enforce as any).isString().matrixSuffix().matrixSuffix(),
          enforce.condition(validated),
        ),
        b: enforce.isString(),
      }) as never,
      enforce.condition(() => true) as never,
    );
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
      test('marker', () => true);
    }, schema as never);
    const full = suite.run({ a: 'x', b: 'ok' } as never);
    expect(full.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'x', b: 'ok' });

    validated.mockClear();
    seen.length = 0;
    expect(() =>
      suite
        .changed('b')
        .focus({ skip: 'a' })
        .run({ a: 'y', b: 'ok2' } as never),
    ).toThrow(/select|container|schema/i);
    expect(seen).toEqual([]);
    expect(validated).not.toHaveBeenCalled();
  });

  it('[SC-MP04b-FAIL] failing custom parser on the selected field reports without exposing failed output', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      custom: compose(
        (enforce as any).isString().matrixFailEmit(),
        enforce.condition(validated),
      ),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
      test('marker', () => true);
    }, schema as never);
    suite.run({ custom: 'good', note: 'first' } as never);
    expect(seen[0]).toEqual({ custom: 'good', note: 'first' });

    validated.mockClear();
    seen.length = 0;
    const failed = suite
      .changed('custom')
      .run({ custom: 'bad', note: 'first' } as never);

    expect(failed.hasErrors()).toBe(true);
    expect(failed.hasErrors('custom')).toBe(true);
    expect(failed.value).toBeUndefined();
    expect(seen[0]).toEqual({ custom: 'bad', note: 'first' });
    expect(validated).not.toHaveBeenCalled();

    seen.length = 0;
    const repaired = suite
      .changed('custom')
      .run({ custom: 'good', note: 'first' } as never);
    expect(repaired.hasErrors()).toBe(false);
    expect(repaired.value).toEqual({ custom: 'good' });
    expect(seen[0]).toEqual({ custom: 'good', note: 'first' });
  });

  it('[SC-MP04b-IDEMPOTENT] idempotent parser output stays stable across focused runs', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf((enforce as any).contractSuffix()),
      note: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create((_data: unknown) => {
      seen.push(_data);
      test('marker', () => true);
    }, schema as never);
    suite.run({ rows: ['a', 'b'], note: 'first' } as never);
    expect(seen[0]).toEqual({ rows: ['a!', 'b!'], note: 'first' });

    const first = suite
      .changed('rows.0')
      .run({ rows: ['c', 'b'], note: 'first' } as never);
    expect(first.hasErrors()).toBe(false);
    expect(first.value).toEqual({
      rows: Object.assign(new Array(2), { 0: 'c!' }),
    });
    expect(seen.at(-1)).toEqual({ rows: ['c', 'b'], note: 'first' });

    const second = suite
      .changed('rows.0')
      .run({ rows: ['d', 'b'], note: 'first' } as never);
    expect(second.hasErrors()).toBe(false);
    expect(second.value).toEqual({
      rows: Object.assign(new Array(2), { 0: 'd!' }),
    });
  });
});

describe('schema contracts: draft versus complete output (AC05 characterization)', () => {
  function draftSuite() {
    const seen: unknown[] = [];
    const suite = create(
      (data: unknown) => {
        seen.push(data);
        test('note', () => true);
      },
      enforce.shape({
        n: enforce.isNumeric().toNumber(),
        note: enforce.isString(),
      }),
    );
    return { seen, suite };
  }

  it('[SC-AC05] first focused run exposes draft data without the untouched required property', () => {
    const { seen, suite } = draftSuite();
    const result = suite.changed('note').run({ note: 'ok' } as never);
    expect(seen).toHaveLength(1);
    expect(Object.hasOwn(seen[0] as object, 'note')).toBe(true);
    expect(Object.hasOwn(seen[0] as object, 'n')).toBe(false);
    expect(result.isValid()).toBe(true);
    expect(Object.hasOwn((result.value ?? {}) as object, 'n')).toBe(false);
  });

  it('[SC-AC05] prior output is absent from later drafts unless revalidated', () => {
    const { seen, suite } = draftSuite();
    const full = suite.run({ n: '42', note: 'ok' });
    expect(full.isValid()).toBe(true);
    expect(full.value).toEqual({ n: 42, note: 'ok' });
    const focused = suite.changed('note').run({ note: 'next' } as never);
    expect(focused.isValid()).toBe(true);
    expect(focused.value).toEqual({ note: 'next' });
    expect(seen[1]).toEqual({ note: 'next' });
  });

  it('[SC-AC05] valid focused value never carries unvalidated current input', () => {
    const seen: unknown[] = [];
    const suite = create(
      (data: any) => {
        seen.push(data);
        test('name', () => {
          enforce(data.name).isString();
        });
        test('note', () => {
          enforce(data.note).isString();
        });
      },
      enforce.shape({
        name: enforce.isString(),
        note: enforce.isString(),
      }),
    );
    expect(suite.run({ name: 'x', note: 'ok' }).isValid()).toBe(true);
    const focused = suite
      .changed('note')
      .run({ name: 123, note: 'ok' } as never);
    expect(focused.isValid()).toBe(true);
    expect(focused.value).toEqual({ note: 'ok' });
    expect(seen[seen.length - 1]).toEqual({ name: 123, note: 'ok' });
  });

  it('[SC-AC05] optional output materializes only when its schema is executed', () => {
    const seen: unknown[] = [];
    const suite = create(
      (data: unknown) => {
        seen.push(data);
        test('note', () => true);
      },
      enforce.shape({
        opt: enforce.optional(enforce.isString()),
        note: enforce.isString(),
      }),
    );
    const full = suite.run({ note: 'ok' });
    expect(Object.hasOwn((full.value ?? {}) as object, 'opt')).toBe(true);
    const focused = suite.changed('note').run({ note: 'next' } as never);
    expect(focused.isValid()).toBe(true);
    expect(Object.hasOwn((focused.value ?? {}) as object, 'opt')).toBe(false);
    expect(Object.hasOwn(seen[1] as object, 'opt')).toBe(false);
    expect(seen[1]).toEqual({ note: 'next' });
  });

  it('[SC-AC05] invalid parser input on an untouched field stays a draft without fabrication', () => {
    const { seen, suite } = draftSuite();
    const result = suite.changed('note').run({ note: 'ok' } as never);
    expect(result.isValid()).toBe(true);
    expect(seen[0]).toEqual({ note: 'ok' });
  });

  it('[SC-AC05] full-run recovery certifies complete output after drafts', () => {
    const { seen, suite } = draftSuite();
    suite.changed('note').run({ note: 'ok' } as never);
    const full = suite.run({ n: '7', note: 'ok' });
    expect(full.isValid()).toBe(true);
    expect(full.value).toEqual({ n: 7, note: 'ok' });
    expect(Object.hasOwn((full.value ?? {}) as object, 'n')).toBe(true);
    expect(seen[seen.length - 1]).toEqual({ n: 7, note: 'ok' });
  });

  it('[SC-AC05] changed([]) exposes declaration data without validation or witness', () => {
    const { seen, suite } = draftSuite();
    const result = suite.changed([]).run({ note: 'ok' } as never);
    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ note: 'ok' });
  });

  it('[SC-PARSER-TOTALITY] malformed parser input fails validation instead of throwing', () => {
    const seen: unknown[] = [];
    const suite = create(
      (data: unknown) => {
        seen.push(data);
      },
      enforce.shape({
        email: enforce.isString().trim().toLower(),
      }),
    );
    for (const run of [
      () => suite.run({ email: 123 } as never),
      () => suite.changed('email').run({ email: 123 } as never),
    ]) {
      let result:
        | ReturnType<typeof suite.run>
        | ReturnType<ReturnType<typeof suite.changed>['run']>
        | undefined;
      expect(() => {
        result = run();
      }).not.toThrow();
      expect(result?.hasErrors('email')).toBe(true);
    }
    expect(seen.length).toBe(2);
  });
});
