import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isNull', () => {
  it('pass only for null', () => {
    expect(enforce.isNull().run(null).pass).toBe(true);
  });

  it('fails for undefined', () => {
    const value: null | undefined = undefined;
    // Type test: - testing that undefined is rejected by isNull
    expect(enforce.isNull().run(value).pass).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: null | number = 0;
    const emptyString: null | string = '';
    const falseBool: null | boolean = false;
    const nanValue: null | number = NaN;

    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(zero).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(emptyString).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(falseBool).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(nanValue).pass).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | number = 42;
    const str: null | string = 'hello';
    const bool: null | boolean = true;
    const obj: null | object = {};
    const arr: null | any[] = [];

    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(num).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(str).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(bool).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(obj).pass).toBe(false);
    // Type test: - testing that non-null values are rejected
    expect(enforce.isNull().run(arr).pass).toBe(false);
  });
});
