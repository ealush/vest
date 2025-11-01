import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNull', () => {
  it('passes only for null', () => {
    expect(enforceLazy.isNull().run(null).passes).toBe(true);
  });

  it('fails for undefined', () => {
    const value: null | undefined = undefined;
    // @ts-expect-error - testing that undefined is rejected by isNull
    expect(enforceLazy.isNull().run(value).passes).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: null | number = 0;
    const emptyString: null | string = '';
    const falseBool: null | boolean = false;
    const nanValue: null | number = NaN;

    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(zero).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(emptyString).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(falseBool).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(nanValue).passes).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | number = 42;
    const str: null | string = 'hello';
    const bool: null | boolean = true;
    const obj: null | object = {};
    const arr: null | any[] = [];

    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(num).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(str).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(bool).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(obj).passes).toBe(false);
    // @ts-expect-error - testing that non-null values are rejected
    expect(enforceLazy.isNull().run(arr).passes).toBe(false);
  });
});
