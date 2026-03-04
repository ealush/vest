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

  describe('cumulative parsed data tracking', () => {
    it('should cumulatively merge parsed data over successive runs', () => {
      const schema = enforce.shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });

      const suite = create(() => {}, schema);

      // First run: only provide firstName, focus on it
      const res1 = suite
        .focus({ only: 'firstName' })
        .run({ firstName: 'John' } as any);
      expect(res1.run.data.raw).toEqual({ firstName: 'John' });
      expect(res1.run.data.parsed).toEqual({ firstName: 'John' });

      // Second run: only provide lastName, focus on it
      // Previous parsed data should be preserved and merged
      const res2 = suite
        .focus({ only: 'lastName' })
        .run({ lastName: 'Doe' } as any);
      expect(res2.run.data.raw).toEqual({ lastName: 'Doe' });
      expect(res2.run.data.parsed).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });

      // The overall value exposed by getters might also reflect this merged state
    });

    it('should overwrite old parsed values with new ones on subsequent runs', () => {
      const schema = enforce.shape({
        count: enforce.isNumber(),
        name: enforce.isString(),
      });

      const suite = create(() => {}, schema);

      const res1 = suite.run({ count: 1, name: 'Initial' });
      expect(res1.run.data.parsed).toEqual({ count: 1, name: 'Initial' });

      // Update count, leave name omitted but we will focus only count
      const res2 = suite.focus({ only: 'count' }).run({ count: 2 } as any);
      expect(res2.run.data.parsed).toEqual({ count: 2, name: 'Initial' });

      // Update both
      const res3 = suite.run({ count: 3, name: 'Updated' });
      expect(res3.run.data.parsed).toEqual({ count: 3, name: 'Updated' });
    });

    it('should not merge raw data, only parsed data', () => {
      const schema = enforce.shape({
        fieldA: enforce.isString(),
        fieldB: enforce.isString(),
      });

      const suite = create(() => {}, schema);

      const res1 = suite
        .focus({ only: 'fieldA' })
        .run({ fieldA: 'A', extra: 'drop-me' } as any);
      expect(res1.run.data.raw).toEqual({ fieldA: 'A', extra: 'drop-me' });
      // Without a strict parse method that strips, enforce.shape passes input as-is
      expect(res1.run.data.parsed).toEqual({ fieldA: 'A', extra: 'drop-me' });

      const res2 = suite
        .focus({ only: 'fieldB' })
        .run({ fieldB: 'B', another: 'raw-only' } as any);
      expect(res2.run.data.raw).toEqual({ fieldB: 'B', another: 'raw-only' });
      // parsed data cumulatively merges the parsed output from previous runs
      expect(res2.run.data.parsed).toEqual({
        fieldA: 'A',
        fieldB: 'B',
        extra: 'drop-me',
        another: 'raw-only',
      });
    });

    it('should fall back to empty object for parsed data chunk if a run fails schema validation, but retain previous valid parsed data', () => {
      const schema = enforce.shape({
        age: enforce.isNumber(),
        name: enforce.isString(),
      });

      const suite = create(() => {}, schema);

      const res1 = suite
        .focus({ only: 'name' })
        .run({ name: 'ValidName' } as any);
      expect(res1.run.data.parsed).toEqual({ name: 'ValidName' });

      // This run will fail schema validation for age since it's a string, not number
      const payload = { age: 'not a number' };
      // @ts-expect-error
      const res2 = suite.focus({ only: 'age' }).run(payload);

      // raw is the new input
      expect(res2.run.data.raw).toEqual(payload);
      // new parsed data is empty due to parse failure, but keeps previous 'name'
      expect(res2.run.data.parsed).toEqual({ name: 'ValidName' });
    });
  });
});
