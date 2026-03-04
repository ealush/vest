import { describe, expect, it } from 'vitest';

import { create, enforce } from '../../vest';

describe('suite result run summary metadata', () => {
  it('stores the original run object and timestamp for non-schema suites', () => {
    const payload = { name: 'alice', meta: { age: 33 } };
    const suite = create((_data: any) => {});

    const before = Date.now();
    const result = suite.run(payload);
    const after = Date.now();

    expect(result.run.data.raw).toBe(payload);
    expect(result.run.data.parsed).toBeUndefined();
    expect(Object.prototype.propertyIsEnumerable.call(result, 'run')).toBe(
      false,
    );
    expect(Object.isFrozen(result.run)).toBe(true);
    expect(result.run.time).toBeInstanceOf(Date);
    expect(result.run.time.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.run.time.getTime()).toBeLessThanOrEqual(after);
  });

  it('stores schema-validated data in run metadata', () => {
    const schema = enforce.loose({ amount: enforce.isNumber() });

    let callbackValue: unknown;
    const suite = create((data: any) => {
      callbackValue = data;
    }, schema);

    const result = suite.run({ amount: 12 });

    expect(result.run.data.raw).toEqual({ amount: 12 });
    expect(result.run.data.parsed).toEqual({ amount: 12 });
    expect(callbackValue).toEqual(result.run.data.parsed);
  });

  it('falls back to the original data in run metadata when schema validation fails', () => {
    const schema = enforce.loose({ amount: enforce.isNumber() });

    const payload = { amount: '12' };
    const suite = create(() => {}, schema);

    // @ts-expect-error - testing schema validation failure with intentionally mismatched data
    const result = suite.run(payload);

    expect(result.run.data.raw).toBe(payload);
    expect(result.run.data.parsed).toEqual({});
  });

  it('captures run.time per run', () => {
    const suite = create((_data: any) => {});

    const first = suite.run({ count: 1 });
    const second = suite.run({ count: 2 });

    expect(second.run.time.getTime()).toBeGreaterThanOrEqual(
      first.run.time.getTime(),
    );
    expect(first.run.data.raw).toEqual({ count: 1 });
    expect(second.run.data.raw).toEqual({ count: 2 });
  });
});
