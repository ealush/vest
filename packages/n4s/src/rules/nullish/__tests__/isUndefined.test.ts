import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runIsUndefined = (value: unknown) =>
  (
    enforce.isUndefined() as ReturnType<typeof enforce.isUndefined> & {
      run: (
        _value: unknown,
      ) => ReturnType<ReturnType<typeof enforce.isUndefined>['run']>;
    }
  ).run(value);

describe('isUndefined', () => {
  it('pass only for undefined', () => {
    expect(enforce.isUndefined().run(undefined).pass).toBe(true);

    let uninitialized: undefined | number;
    // Type test: - uninitialized may be number | undefined
    expect(runIsUndefined(uninitialized).pass).toBe(true);
  });

  it('fails for null', () => {
    const value: undefined | null = null;
    // Type test: - testing that null is rejected by isUndefined
    expect(runIsUndefined(value).pass).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: undefined | number = 0;
    const emptyString: undefined | string = '';
    const falseBool: undefined | boolean = false;
    const nanValue: undefined | number = NaN;

    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(zero).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(emptyString).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(falseBool).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(nanValue).pass).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: undefined | number = 42;
    const str: undefined | string = 'hello';
    const bool: undefined | boolean = true;
    const obj: undefined | object = {};
    const arr: undefined | any[] = [];

    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(num).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(str).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(bool).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(obj).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(runIsUndefined(arr).pass).toBe(false);
  });
});
