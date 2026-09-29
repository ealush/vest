import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { compose } from 'n4s';
import { SchemaExclusionError } from 'n4s/exports/internal';

import { create, enforce, test } from '../../vest';

describe('schema input, selected execution, and output', () => {
  it('does not evaluate an unselected getter while preparing callback or output', () => {
    const getter = vi.fn(() => {
      throw new Error('unselected getter');
    });
    const input = Object.defineProperty({ a: 'ok' }, 'b', {
      enumerable: true,
      get: getter,
    });
    const suite = create(
      () => test('a', () => true),
      enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
    );
    expect(suite.changed('a').run(input).value).toEqual({ a: 'ok' });
    expect(getter).not.toHaveBeenCalled();
  });

  it('hands a passing full run its complete parsed output', () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        test('age', () => true);
      },
      enforce.shape({ age: enforce.isNumeric().toNumber() }),
    );
    const result = suite.run({ age: '42' });
    expect(seen).toEqual([{ age: 42 }]);
    expect(result.run.data.raw).toEqual({ age: 42 });
    expect(result.run.data.parsed).toEqual({ age: 42 });
    expect(result.value).toEqual({ age: 42 });
    if (result.valid) expectTypeOf(result.value.age).toEqualTypeOf<number>();
  });

  it('never promotes untouched input or old output into current focused evidence', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isNumeric().toNumber(),
      }),
    );
    suite.run({ a: 'old', b: '42' });
    const focused = suite.changed('a').run({ a: 'new', b: '99' });
    expect(focused.value).toEqual({ a: 'new' });
    expect(focused.types?.output).toEqual({ a: 'new' });
    expect(focused.run.data.parsed).toEqual({ a: 'new' });
    expect(suite.get().value).toEqual({ a: 'new' });
    if (focused.valid) {
      expectTypeOf(focused.value.b).toEqualTypeOf<number | undefined>();
    }
  });

  it('does not replay selected parsers or execute unselected parsers', () => {
    const selected = vi.fn((value: string) => ({
      pass: true,
      type: value.toUpperCase(),
    }));
    const excluded = vi.fn(() => {
      throw new Error('excluded parser');
    });
    enforce.extend({
      coherenceSelected: selected,
      coherenceExcluded: excluded,
    });
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.coherenceSelected(),
        b: enforce.coherenceExcluded(),
      }),
    );
    const result = suite.changed('a').run({ a: 'yes', b: 'no' });
    expect(result.value).toEqual({ a: 'YES' });
    expect(selected).toHaveBeenCalledTimes(1);
    expect(excluded).not.toHaveBeenCalled();
    suite.changed([]).run({ a: 'empty', b: 'empty' });
    expect(selected).toHaveBeenCalledTimes(1);
    expect(excluded).not.toHaveBeenCalled();
  });

  it('keeps sparse array positions and partial elements honest', () => {
    const suite = create(
      () => test('rows.1.a', () => true),
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.shape({
            a: enforce.isString(),
            b: enforce.isString(),
          }),
        ),
      }),
    );
    const result = suite
      .changed('rows.1.a')
      .run({ rows: [{ a: 'zero' }, { a: 'one' }] });
    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('selected field should pass');
    expect(result.value.rows).toHaveLength(2);
    expect(Object.hasOwn(result.value.rows!, 0)).toBe(false);
    expect(result.value.rows?.[1]).toEqual({ a: 'one' });
    expectTypeOf(result.value.rows?.[1]?.b).toEqualTypeOf<string | undefined>();
  });

  it('rejects opaque projection before any selected or excluded effect', () => {
    const calls = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        a: enforce.condition(calls),
        b: enforce.condition(calls),
      }),
      enforce.condition(calls),
    );
    const callback = vi.fn();
    const suite = create(callback, schema);
    expect(() => suite.changed('a').run({ a: 'a', b: 'b' })).toThrow(
      SchemaExclusionError,
    );
    expect(calls).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('checks unsupported array descendants before earlier selected fields execute', () => {
    const calls = vi.fn(() => true);
    const suite = create(
      () => {},
      enforce.shape({
        a: enforce.condition(calls),
        rows: enforce.isArrayOf(
          compose(
            enforce.shape({ b: enforce.isString() }),
            enforce.condition(calls),
          ),
        ),
      }),
    );
    expect(() =>
      suite.changed(['a', 'rows.0.b']).run({ a: 1, rows: [{ b: 'b' }] }),
    ).toThrow(SchemaExclusionError);
    expect(calls).not.toHaveBeenCalled();
  });
});

declare global {
  namespace n4s {
    interface EnforceMatchers {
      coherenceSelected: (value: string) => { pass: boolean; type: string };
      coherenceExcluded: (value: string) => never;
    }
  }
}
