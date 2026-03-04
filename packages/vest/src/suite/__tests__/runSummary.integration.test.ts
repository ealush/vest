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
    it('should show different raw and parsed values when parsers transform data', () => {
      const schema = enforce.shape({
        name: enforce.isString().trim().toUpper(),
        age: enforce.isNumeric().toNumber(),
      });

      const suite = create(() => {}, schema);

      // @ts-expect-error - testing parser coercion: age is string '25' that gets parsed to number
      const result = suite.run({ name: '  alice  ', age: '25' });

      // raw reflects the parsed/transformed input for the current run
      expect(result.run.data.raw).toEqual({ name: 'ALICE', age: 25 });

      // parsed also holds the same transformed values
      expect(result.run.data.parsed).toEqual({ name: 'ALICE', age: 25 });

      // Critical: the original input was '  alice  ' (string with spaces)
      // and '25' (string), but parsed values are 'ALICE' (trimmed+uppercased)
      // and 25 (number) — proving the parser pipeline ran
      expect(result.run.data.parsed).not.toEqual({
        name: '  alice  ',
        age: '25',
      });
    });

    it('should cumulatively merge parsed data over successive focused runs with parsers', () => {
      const schema = enforce.shape({
        firstName: enforce.isString().trim().toUpper(),
        lastName: enforce.isString().trim(),
      });

      const suite = create(() => {}, schema);

      // Run 1: focus on firstName only, pass untrimmed input
      const res1 = suite
        .focus({ only: 'firstName' })
        .run({ firstName: '  john  ' } as any);

      // raw is the transformed value for this run
      expect(res1.run.data.raw).toEqual({ firstName: 'JOHN' });
      // parsed holds the parsed output
      expect(res1.run.data.parsed).toEqual({ firstName: 'JOHN' });

      // Run 2: focus on lastName only, pass untrimmed input
      const res2 = suite
        .focus({ only: 'lastName' })
        .run({ lastName: '  doe  ' } as any);

      // raw is ONLY the current run's transformed value
      expect(res2.run.data.raw).toEqual({ lastName: 'doe' });

      // parsed cumulatively merges: firstName from Run 1 is retained as 'JOHN'
      expect(res2.run.data.parsed).toEqual({
        firstName: 'JOHN',
        lastName: 'doe',
      });
    });

    it('should overwrite previously parsed values with new transformed values on subsequent runs', () => {
      const schema = enforce.shape({
        score: enforce.isNumeric().toNumber(),
        label: enforce.isString().trim().toUpper(),
      });

      const suite = create(() => {}, schema);

      // Run 1: both fields
      // @ts-expect-error - testing parser coercion: score is string that gets parsed to number
      const res1 = suite.run({ score: '42', label: '  hello  ' });
      expect(res1.run.data.parsed).toEqual({ score: 42, label: 'HELLO' });

      // Run 2: focus on score only, update it
      const res2 = suite.focus({ only: 'score' }).run({ score: '99' } as any);
      // parsed retains the previous label and updates score
      expect(res2.run.data.parsed).toEqual({ score: 99, label: 'HELLO' });

      // Run 3: update both again
      // @ts-expect-error - testing parser coercion
      const res3 = suite.run({ score: '7', label: '  world  ' });
      expect(res3.run.data.parsed).toEqual({ score: 7, label: 'WORLD' });
    });

    it('should retain parsed values from previous runs even when current run fails schema validation', () => {
      const schema = enforce.shape({
        age: enforce.isNumber(),
        name: enforce.isString().trim().toUpper(),
      });

      const suite = create(() => {}, schema);

      // Run 1: valid name, parsed to trimmed+uppercase
      const res1 = suite
        .focus({ only: 'name' })
        .run({ name: '  valid  ' } as any);
      expect(res1.run.data.parsed).toEqual({ name: 'VALID' });

      // Run 2: invalid age (string instead of number) — schema validation fails
      const payload = { age: 'not a number' };
      // @ts-expect-error
      const res2 = suite.focus({ only: 'age' }).run(payload);

      // raw is the failing input
      expect(res2.run.data.raw).toEqual(payload);
      // parsed retains the previous valid 'name' since the current chunk failed
      expect(res2.run.data.parsed).toEqual({ name: 'VALID' });
    });

    it('should prove parsed values are transformed types (number vs string) that persist across runs', () => {
      const schema = enforce.shape({
        count: enforce.isNumeric().toNumber(),
        tag: enforce.isString().trim(),
      });

      const suite = create(() => {}, schema);

      // Run 1: focus on count — input is string '10', parsed should be number 10
      const res1 = suite.focus({ only: 'count' }).run({ count: '10' } as any);
      expect(res1.run.data.parsed).toEqual({ count: 10 });
      expect(typeof (res1.run.data.parsed as any).count).toBe('number');

      // Run 2: focus on tag
      const res2 = suite
        .focus({ only: 'tag' })
        .run({ tag: '  trimmed  ' } as any);
      expect(res2.run.data.parsed).toEqual({ count: 10, tag: 'trimmed' });

      // Verify the count from Run 1 is still a number, not reverted to string
      expect(typeof (res2.run.data.parsed as any).count).toBe('number');
      expect((res2.run.data.parsed as any).count).toBe(10);
    });
  });
});
