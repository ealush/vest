import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runIsNullish = (value: unknown) =>
  (
    enforce.isNullish() as ReturnType<typeof enforce.isNullish> & {
      run: (
        _value: unknown,
      ) => ReturnType<ReturnType<typeof enforce.isNullish>['run']>;
    }
  ).run(value);

describe('isNullish', () => {
  it('pass for null', () => {
    expect(enforce.isNullish().run(null).pass).toBe(true);
  });

  it('pass for undefined', () => {
    expect(enforce.isNullish().run(undefined).pass).toBe(true);

    let uninitialized: null | undefined | number;
    // Type test: - uninitialized may be number | null | undefined
    expect(runIsNullish(uninitialized).pass).toBe(true);
  });

  it('fails for falsy non-nullish primitives', () => {
    const zero: null | undefined | number = 0;
    const emptyString: null | undefined | string = '';
    const falseBool: null | undefined | boolean = false;
    const nanValue: null | undefined | number = NaN;

    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(zero).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(emptyString).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(falseBool).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(nanValue).pass).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | undefined | number = 42;
    const str: null | undefined | string = 'hello';
    const bool: null | undefined | boolean = true;
    const obj: null | undefined | object = {};
    const arr: null | undefined | any[] = [];

    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(num).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(str).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(bool).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(obj).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(runIsNullish(arr).pass).toBe(false);
  });
});
