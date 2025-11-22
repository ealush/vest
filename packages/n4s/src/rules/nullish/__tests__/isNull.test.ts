import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runIsNull = (value: unknown) =>
  (
    enforce.isNull() as ReturnType<typeof enforce.isNull> & {
      run: (
        _value: unknown,
      ) => ReturnType<ReturnType<typeof enforce.isNull>['run']>;
    }
  ).run(value);

describe('isNull', () => {
  it('pass only for null', () => {
    expect(enforce.isNull().run(null).pass).toBe(true);
  });

  it('fails for undefined', () => {
    const value: null | undefined = undefined;
    // Type test: - testing that undefined is rejected by isNull
    expect(runIsNull(value).pass).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: null | number = 0;
    const emptyString: null | string = '';
    const falseBool: null | boolean = false;
    const nanValue: null | number = NaN;

    // Type test: - testing that non-null values are rejected
    expect(runIsNull(zero).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(emptyString).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(falseBool).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(nanValue).pass).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | number = 42;
    const str: null | string = 'hello';
    const bool: null | boolean = true;
    const obj: null | object = {};
    const arr: null | any[] = [];

    // Type test: - testing that non-null values are rejected
    expect(runIsNull(num).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(str).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(bool).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(obj).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(runIsNull(arr).pass).toBe(false);
  });
});
