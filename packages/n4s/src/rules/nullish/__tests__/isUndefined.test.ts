import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isUndefined', () => {
  it('pass only for undefined', () => {
    expect(enforce.isUndefined().run(undefined).pass).toBe(true);

    let uninitialized: undefined | number;
    // Type test: - uninitialized may be number | undefined
    expect(enforce.isUndefined().run(uninitialized).pass).toBe(true);
  });

  it('fails for null', () => {
    const value: undefined | null = null;
    // Type test: - testing that null is rejected by isUndefined
    expect(enforce.isUndefined().run(value).pass).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: undefined | number = 0;
    const emptyString: undefined | string = '';
    const falseBool: undefined | boolean = false;
    const nanValue: undefined | number = NaN;

    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(zero).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(emptyString).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(falseBool).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(nanValue).pass).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: undefined | number = 42;
    const str: undefined | string = 'hello';
    const bool: undefined | boolean = true;
    const obj: undefined | object = {};
    const arr: undefined | any[] = [];

    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(num).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(str).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(bool).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(obj).pass).toBe(false);
    // Type test: - testing that non-undefined values are rejected
    expect(enforce.isUndefined().run(arr).pass).toBe(false);
  });
});
