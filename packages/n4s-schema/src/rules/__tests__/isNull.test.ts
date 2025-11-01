import { describe, it, expect } from 'vitest';

import { isNull } from '../nullish/isNull';

describe('isNull', () => {
  it('passes only for null', () => {
    expect(isNull().run(null).passes).toBe(true);
  });

  it('fails for undefined', () => {
    const value: null | undefined = undefined;
    // @ts-expect-error - testing that undefined is rejected by isNull
    expect(isNull().run(value).passes).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: null | number = 0;
    const emptyString: null | string = '';
    const falseBool: null | boolean = false;
    const nanValue: null | number = NaN;

    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(zero).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(emptyString).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(falseBool).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(nanValue).passes).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | number = 42;
    const str: null | string = 'hello';
    const bool: null | boolean = true;
    const obj: null | object = {};
    const arr: null | any[] = [];

    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(num).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(str).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(bool).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(obj).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(isNull().run(arr).passes).toBe(false);
  });
});
