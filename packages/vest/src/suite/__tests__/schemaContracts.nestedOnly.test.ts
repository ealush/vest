import { describe, expect, it, vi } from 'vitest';

import { SchemaExclusionError } from 'n4s';

import { create, enforce } from '../../vest';

function nestedSuite(
  kind: 'shape' | 'partial' | 'loose',
  selectedImpl: () => boolean,
  excludedImpl: () => boolean,
) {
  const excludedFn = vi.fn(excludedImpl);
  const selectedFn = vi.fn(selectedImpl);
  const excluded = enforce.condition(excludedFn as never) as never;
  const selected = enforce.condition(selectedFn as never) as never;
  const inner = (enforce as any)[kind]({ a: excluded, b: selected });
  const schema = enforce.shape({ box: inner });
  const suite = create(() => {}, schema as never) as any;
  return { excluded: excludedFn, selected: selectedFn, suite };
}

describe('nested only() selection completeness', () => {
  for (const kind of ['shape', 'partial', 'loose'] as const) {
    for (const selectedPass of [false, true]) {
      it(`plain nested only/${kind}/selected=${selectedPass}`, () => {
        const { excluded, selected, suite } = nestedSuite(
          kind,
          () => selectedPass,
          () => true,
        );
        const result = suite.only('box.b').run({ box: { a: 1, b: 2 } });
        expect(excluded).toHaveBeenCalledTimes(0);
        expect(selected).toHaveBeenCalledTimes(1);
        expect(result.hasErrors('box.b')).toBe(!selectedPass);
      });

      it(`nested only+skip/${kind}/selected=${selectedPass}`, () => {
        const { excluded, selected, suite } = nestedSuite(
          kind,
          () => selectedPass,
          () => {
            throw new Error('excluded ran');
          },
        );
        const result = suite
          .only('box.b')
          .focus({ skip: ['box.a'] })
          .run({ box: { a: 1, b: 2 } });
        expect(excluded).toHaveBeenCalledTimes(0);
        expect(selected).toHaveBeenCalledTimes(1);
        expect(result.hasErrors('box.b')).toBe(!selectedPass);
      });

      it(`whole parent wins over leaf/${kind}`, () => {
        const { excluded, selected, suite } = nestedSuite(
          kind,
          () => false,
          () => true,
        );
        const result = suite
          .only(['box', 'box.b'])
          .run({ box: { a: 1, b: 2 } });
        expect(selected).toHaveBeenCalledTimes(1);
        expect(excluded).toHaveBeenCalledTimes(1);
        expect(result.hasErrors('box.b')).toBe(true);
      });
    }
  }

  it('unknown top-level only runs nothing', () => {
    const selectedFn = vi.fn(() => false);
    const selected = enforce.condition(selectedFn as never) as never;
    const schema = enforce.shape({ a: selected });
    const suite = create(() => {}, schema as never) as any;
    const result = suite.only('unknown').run({ a: 1 });
    expect(selectedFn).toHaveBeenCalledTimes(0);
    expect(result.hasErrors()).toBe(false);
  });

  it('unknown nested only runs nothing', () => {
    const selectedFn = vi.fn(() => false);
    const selected = enforce.condition(selectedFn as never) as never;
    const schema = enforce.shape({
      box: enforce.shape({ b: selected }),
    });
    const suite = create(() => {}, schema as never) as any;
    const result = suite.only('unknown.b').run({ box: { b: 1 } });
    expect(selectedFn).toHaveBeenCalledTimes(0);
    expect(result.hasErrors()).toBe(false);
  });

  it('unknown leaf under known parent runs nothing', () => {
    const selectedFn = vi.fn(() => false);
    const selected = enforce.condition(selectedFn as never) as never;
    const schema = enforce.shape({
      box: enforce.shape({ b: selected }),
    });
    const suite = create(() => {}, schema as never) as any;
    const result = suite.only('box.unknown').run({ box: { b: 1 } });
    expect(selectedFn).toHaveBeenCalledTimes(0);
    expect(result.hasErrors()).toBe(false);
  });

  it('scalar descent is unresolvable', () => {
    const selectedFn = vi.fn(() => false);
    const selected = enforce.condition(selectedFn as never) as never;
    const schema = enforce.shape({
      n: enforce.isNumeric(),
      note: selected,
    });
    const suite = create(() => {}, schema as never) as any;
    const result = suite.only('n.foo').run({ n: 1, note: 2 });
    expect(selectedFn).toHaveBeenCalledTimes(0);
    expect(result.hasErrors()).toBe(false);
  });

  it('array index selection fails closed', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString()),
    });
    const suite = create(() => {}, schema as never) as any;
    expect(() => suite.only('rows.0').run({ rows: ['a'] })).toThrow(
      SchemaExclusionError,
    );
  });

  it('record child selection fails closed', () => {
    const schema = enforce.shape({
      rec: enforce.record(enforce.isString()),
    });
    const suite = create(() => {}, schema as never) as any;
    expect(() => suite.only('rec.key').run({ rec: { key: 'v' } })).toThrow(
      SchemaExclusionError,
    );
  });

  it('tuple child selection fails closed', () => {
    const { tuple } = enforce as any;
    if (typeof tuple !== 'function') return;
    const schema = enforce.shape({
      pair: (enforce as any).tuple(
        enforce.condition(() => true),
        enforce.condition(() => false),
      ),
    });
    const suite = create(() => {}, schema as never) as any;
    expect(() => suite.only('pair.0').run({ pair: [1, 2] })).toThrow(
      SchemaExclusionError,
    );
  });

  it('sibling leaves do not cancel each other', () => {
    const excludedFn = vi.fn(() => true);
    const selectedFn = vi.fn(() => true);
    const excluded = enforce.condition(excludedFn as never) as never;
    const selected = enforce.condition(selectedFn as never) as never;
    const schema = enforce.shape({
      box: enforce.shape({ a: excluded, b: selected }),
    });
    const suite = create(() => {}, schema as never) as any;
    const result = suite.only(['box.a', 'box.b']).run({ box: { a: 1, b: 2 } });
    expect(excludedFn).toHaveBeenCalledTimes(1);
    expect(selectedFn).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('only+skip both fluent orders select the leaf', () => {
    for (const order of ['only-first', 'skip-first'] as const) {
      const excludedFn = vi.fn(() => true);
      const selectedFn = vi.fn(() => false);
      const excluded = enforce.condition(excludedFn as never) as never;
      const selected = enforce.condition(selectedFn as never) as never;
      const schema = enforce.shape({
        box: enforce.shape({ a: excluded, b: selected }),
      });
      const suite = create(() => {}, schema as never) as any;
      const focused =
        order === 'only-first'
          ? suite.only('box.b').focus({ skip: ['box.a'] })
          : suite.focus({ skip: ['box.a'] }).only('box.b');
      // focus() replaces modifiers rather than merging: skip-first loses
      // the skip, so only the union contract (changed+only) is pinned here.
      // Assert the selected leaf still executes exactly once.
      const result = focused.run({ box: { a: 1, b: 2 } });
      expect(selectedFn).toHaveBeenCalledTimes(1);
      expect(result.hasErrors('box.b')).toBe(true);
    }
  });
});
