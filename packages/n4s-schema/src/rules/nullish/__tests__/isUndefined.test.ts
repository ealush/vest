import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isUndefined', () => {
  it('passes only for undefined', () => {
    expect(enforceLazy.isUndefined().run(undefined).passes).toBe(true);

    let uninitialized: undefined | number;
    // @ts-expect-error - uninitialized may be number | undefined
    expect(enforceLazy.isUndefined().run(uninitialized).passes).toBe(true);
  });

  it('fails for null', () => {
    const value: undefined | null = null;
    // @ts-expect-error - testing that null is rejected by isUndefined
    expect(enforceLazy.isUndefined().run(value).passes).toBe(false);
  });

  it('fails for falsy primitives', () => {
    const zero: undefined | number = 0;
    const emptyString: undefined | string = '';
    const falseBool: undefined | boolean = false;
    const nanValue: undefined | number = NaN;

    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(zero).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(emptyString).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(falseBool).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(nanValue).passes).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: undefined | number = 42;
    const str: undefined | string = 'hello';
    const bool: undefined | boolean = true;
    const obj: undefined | object = {};
    const arr: undefined | any[] = [];

    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(num).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(str).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(bool).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(obj).passes).toBe(false);
    // @ts-expect-error - testing that non-undefined values are rejected
    expect(enforceLazy.isUndefined().run(arr).passes).toBe(false);
  });
});
