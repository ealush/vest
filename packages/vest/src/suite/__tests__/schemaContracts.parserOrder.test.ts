import { describe, expect, it, vi } from 'vitest';
import { compose, enforce } from 'n4s';

import { create, test } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      orderSuffix: (value: string) => { pass: boolean; type: string };
      orderEmit: (value: string) => { pass: boolean; type: string };
    }
  }
}

enforce.extend(
  {
    orderSuffix: (value: string) => ({ pass: true, type: `${value}!` }),
    orderEmit: (value: string) => ({ pass: true, type: `emit:${value}` }),
  },
  { parsers: ['orderSuffix', 'orderEmit'] },
);

// MP04b: parser-before/after/nested/custom matrix. Mapping runs declared
// parsers exactly once per selected execution; ordinary validators are never
// retried as parser probes; skipped fields map honestly from retention.
describe('schema contracts: parser ordering matrix (MP04b)', () => {
  it('[SC-MP04b] parser after validation maps fresh output exactly once', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      a: compose(
        enforce.isString(),
        enforce.orderSuffix(),
        enforce.condition(validated),
      ),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    const result = suite.changed('a').run({ a: 'x', b: 'ok' });
    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'x!', b: 'ok' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-MP04b] parser before validation observes raw input and validates once', () => {
    const observed: unknown[] = [];
    const validated = vi.fn((value: unknown) => {
      observed.push(value);
      return value === 'x!';
    });
    const schema = enforce.shape({
      a: compose(
        enforce.isString().orderSuffix(),
        enforce.condition(validated),
      ),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    const result = suite.changed('a').run({ a: 'x', b: 'ok' });
    expect(result.hasErrors()).toBe(false);
    // The validator observed the parser output, exactly once.
    expect(observed).toEqual(['x!']);
    expect(validated).toHaveBeenCalledTimes(1);
    expect(seen[0]).toEqual({ a: 'x!', b: 'ok' });
  });

  it('[SC-MP04b] nested parsers chain in order without validator retry', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      a: compose(
        enforce.isString().orderSuffix().orderSuffix(),
        enforce.condition(validated),
      ),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    const result = suite.changed('a').run({ a: 'x', b: 'ok' });
    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'x!!', b: 'ok' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-MP04b] custom registered parser maps honestly on selection and retention on skip', () => {
    const validated = vi.fn(() => true);
    const schema = enforce.shape({
      a: compose(enforce.isString().orderEmit(), enforce.condition(validated)),
      b: enforce.isString(),
    });
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('b', () => true);
    }, schema as never);
    const full = suite.run({ a: 'x', b: 'first' });
    expect(full.isValid()).toBe(true);
    expect(seen[0]).toEqual({ a: 'emit:x', b: 'first' });
    expect(validated).toHaveBeenCalledTimes(1);

    validated.mockClear();
    seen.length = 0;
    const skipped = suite
      .changed('b')
      .focus({ skip: 'a' })
      .run({ a: 'y', b: 'second' });
    expect(skipped.hasErrors()).toBe(false);
    // Skipped custom parser maps from retention, never revalidates.
    expect(seen[0]).toEqual({ a: 'emit:x', b: 'second' });
    expect(validated).not.toHaveBeenCalled();

    validated.mockClear();
    seen.length = 0;
    const selected = suite.changed('a').run({ a: 'z', b: 'second' });
    expect(selected.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 'emit:z', b: 'second' });
    expect(validated).toHaveBeenCalledTimes(1);
  });

  it('[SC-MP04b] a failing validator is never retried into a passing verdict', () => {
    const predicate = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const schema = enforce.shape({
      a: compose(
        enforce.isString().orderSuffix(),
        enforce.condition(predicate),
      ),
    });
    const suite = create((_data: unknown) => {
      test('a', () => true);
    }, schema as never);
    const result = suite.changed('a').run({ a: 'x' });
    expect(result.hasErrors('a')).toBe(true);
    expect(predicate).toHaveBeenCalledTimes(1);
  });
});
