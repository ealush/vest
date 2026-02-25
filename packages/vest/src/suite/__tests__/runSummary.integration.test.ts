import { describe, expect, it } from 'vitest';

import { create } from '../../vest';

describe('suite result run summary metadata', () => {
  it('stores the original run object and timestamp for non-schema suites', () => {
    const payload = { name: 'alice', meta: { age: 33 } };
    const suite = create((_data: any) => {});

    const before = Date.now();
    const result = suite.run(payload);
    const after = Date.now();

    expect(result.run.data).toBe(payload);
    expect(Object.prototype.propertyIsEnumerable.call(result, 'run')).toBe(
      false,
    );
    expect(result.run.time).toBeInstanceOf(Date);
    expect(result.run.time.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.run.time.getTime()).toBeLessThanOrEqual(after);
  });

  it('stores parsed schema data in run metadata', () => {
    const schema = {
      parse: (value: any) => ({ amount: Number(value.amount) }),
      run: (value: any) => ({ pass: true, type: value }),
    } as any;

    let callbackValue: unknown;
    const suite = create((data: any) => {
      callbackValue = data;
    }, schema);

    const result = suite.run({ amount: '12' } as any);

    expect(result.run.data).toEqual({ amount: 12 });
    expect(callbackValue).toEqual(result.run.data);
  });

  it('falls back to the original data in run metadata when parse fails', () => {
    const schema = {
      parse: () => {
        throw new TypeError('parse failed');
      },
      run: (value: any) => ({
        pass: true,
        type: value,
      }),
    } as any;

    const payload = { amount: '12' };
    const suite = create(() => {}, schema);

    const result = suite.run(payload);

    expect(result.run.data).toBe(payload);
  });

  it('captures run.time per run', () => {
    const suite = create((_data: any) => {});

    const first = suite.run({ count: 1 });
    const second = suite.run({ count: 2 });

    expect(second.run.time.getTime()).toBeGreaterThanOrEqual(
      first.run.time.getTime(),
    );
    expect(first.run.data).toEqual({ count: 1 });
    expect(second.run.data).toEqual({ count: 2 });
  });
});
